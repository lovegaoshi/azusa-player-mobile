package com.noxplay.noxplayer.potoken

import android.content.Context
import timber.log.Timber

/**
 * Caches one WebView BotGuard generator per integrity-token lifetime.
 *
 * Follows SmartTube's WebPoTokenProvider: a session token is minted from visitorData once, and the
 * content token is minted from videoId for each request. A failed content-token generation triggers
 * one generator recreation before giving up.
 */
class PoTokenProvider(context: Context) {
    private val appContext = context.applicationContext
    private val lock = Any()

    @Volatile
    private var webViewBadImpl = false

    private var generator: PoTokenGenerator? = null
    private var visitorData: String? = null
    private var streamingPot: String? = null
    private var expirationMs = -1L

    fun getPOToken(videoId: String): PoTokenResult? = getPOToken(videoId, null)

    fun getPOToken(videoId: String, suppliedVisitorData: String?): PoTokenResult? =
        getPOToken(videoId, suppliedVisitorData, forceRecreate = false)

    private fun getPOToken(
        videoId: String,
        suppliedVisitorData: String?,
        forceRecreate: Boolean,
    ): PoTokenResult? {
        if (webViewBadImpl) return null

        return try {
            generate(videoId, suppliedVisitorData, forceRecreate)
        } catch (e: BadWebViewException) {
            Timber.tag(TAG).e(e, "Could not obtain poToken because WebView is broken")
            webViewBadImpl = true
            null
        } catch (e: LinkageError) {
            Timber.tag(TAG).e(e, "Could not obtain poToken because of a missing platform API")
            webViewBadImpl = true
            null
        }
    }

    private fun generate(
        videoId: String,
        suppliedVisitorData: String?,
        forceRecreate: Boolean,
    ): PoTokenResult {
        data class GeneratorState(
            val generator: PoTokenGenerator,
            val visitorData: String,
            val streamingPot: String,
            val recreated: Boolean,
        )

        val state =
            synchronized(lock) {
                val shouldRecreate =
                    generator == null ||
                        visitorData == null ||
                        streamingPot == null ||
                        System.currentTimeMillis() > expirationMs ||
                        forceRecreate

                if (shouldRecreate) {
                    releaseLocked()

                    val newGenerator = PoTokenWebView.newPoTokenGenerator(appContext)
                    val newVisitorData =
                        suppliedVisitorData
                            ?: PoTokenVisitor.getVisitorData()
                            ?: newGenerator.homepageVisitorData
                            ?: throw PoTokenException("Could not obtain visitorData")

                    // The streaming token must be minted before any other token.
                    val newStreamingPot =
                        try {
                            newGenerator.generatePoToken(newVisitorData)
                        } catch (t: Throwable) {
                            runCatching { newGenerator.close() }
                            throw t
                        }

                    generator = newGenerator
                    visitorData = newVisitorData
                    streamingPot = newStreamingPot
                    expirationMs = newGenerator.expirationMs
                }

                GeneratorState(generator!!, visitorData!!, streamingPot!!, shouldRecreate)
            }

        val playerPot =
            try {
                if (videoId.isEmpty()) "" else state.generator.generatePoToken(videoId)
            } catch (t: Throwable) {
                if (state.recreated) throw t
                Timber.tag(TAG).w(t, "Failed to obtain poToken, retrying with a new generator")
                return generate(videoId, suppliedVisitorData, forceRecreate = true)
            }

        return PoTokenResult(state.visitorData, playerPot, state.streamingPot)
    }

    fun release() =
        synchronized(lock) {
            releaseLocked()
        }

    private fun releaseLocked() {
        generator?.let { oldGenerator ->
            PoTokenThreading.runOnMainThread { runCatching { oldGenerator.close() } }
        }
        generator = null
        visitorData = null
        streamingPot = null
        expirationMs = -1L
    }

    private companion object {
        const val TAG = "PoTokenProvider"
    }
}
