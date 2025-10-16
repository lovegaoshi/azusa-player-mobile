package org.schabi.newpipe.util.potoken

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import org.schabi.newpipe.extractor.NewPipe
import org.schabi.newpipe.extractor.services.youtube.InnertubeClientRequestInfo
import org.schabi.newpipe.extractor.services.youtube.PoTokenProvider
import org.schabi.newpipe.extractor.services.youtube.PoTokenResult
import org.schabi.newpipe.extractor.services.youtube.YoutubeParsingHelper
import com.noxplay.noxplayer.BuildConfig

class PoTokenProviderImpl (private var context: Context) : PoTokenProvider {
    val TAG = PoTokenProviderImpl::class.simpleName
    private var webViewBadImpl = false // whether the system has a bad WebView implementation
    private object WebPoTokenGenLock
    private var webPoTokenVisitorData: String? = null
    private var webPoTokenStreamingPot: String? = null
    private var webPoTokenGenerator: PoTokenGenerator? = null

    fun getWebClientPoToken(videoId: String, visitorData: String?): PoTokenResult? {
        return getWebClientPoToken(videoId = videoId, forceRecreate = false, visitorData = visitorData)
    }

    override fun getWebClientPoToken(videoId: String): PoTokenResult? {
        if (webViewBadImpl) {
            return null
        }

        try {
            return getWebClientPoToken(videoId = videoId, forceRecreate = false)
        } catch (e: RuntimeException) {
            // RxJava's Single wraps exceptions into RuntimeErrors, so we need to unwrap them here
            when (val cause = e.cause) {
                is BadWebViewException -> {
                    Log.e(TAG, "Could not obtain poToken because WebView is broken", e)
                    webViewBadImpl = true
                    return null
                }
                null -> throw e
                else -> throw cause // includes PoTokenException
            }
        }
    }

    private fun getVisitorData(): String? {
        val innertubeClientRequestInfo = InnertubeClientRequestInfo.ofWebClient()
        innertubeClientRequestInfo.clientInfo.clientVersion =
            YoutubeParsingHelper.getClientVersion()

        webPoTokenVisitorData = YoutubeParsingHelper.getVisitorDataFromInnertube(
            innertubeClientRequestInfo,
            NewPipe.getPreferredLocalization(),
            NewPipe.getPreferredContentCountry(),
            YoutubeParsingHelper.getYouTubeHeaders(),
            YoutubeParsingHelper.YOUTUBEI_V1_URL,
            null,
            false
        )
        return webPoTokenVisitorData
    }

    /**
     * @param forceRecreate whether to force the recreation of [webPoTokenGenerator], to be used in
     * case the current [webPoTokenGenerator] threw an error last time
     * [PoTokenGenerator.generatePoToken] was called
     */
    fun getWebClientPoToken(videoId: String, forceRecreate: Boolean): PoTokenResult {
        return getWebClientPoToken(videoId, forceRecreate, null)
    }

    private fun getWebClientPoToken(videoId: String, forceRecreate: Boolean, visitorData: String?): PoTokenResult {
        // just a helper class since Kotlin does not have builtin support for 4-tuples
        data class Quadruple<T1, T2, T3, T4>(val t1: T1, val t2: T2, val t3: T3, val t4: T4)

        val (poTokenGenerator, visitorData, streamingPot, hasBeenRecreated) =
            synchronized(WebPoTokenGenLock) {
                val shouldRecreate = webPoTokenGenerator == null || forceRecreate ||
                    webPoTokenGenerator!!.isExpired()

                if (shouldRecreate) {

                    webPoTokenVisitorData = visitorData ?: getVisitorData()
                    // close the current webPoTokenGenerator on the main thread
                    webPoTokenGenerator?.let { Handler(Looper.getMainLooper()).post { it.close() } }

                    // create a new webPoTokenGenerator
                    webPoTokenGenerator = PoTokenWebView
                        .newPoTokenGenerator(context).blockingGet()

                    // The streaming poToken needs to be generated exactly once before generating
                    // any other (player) tokens.
                    webPoTokenStreamingPot = webPoTokenGenerator!!
                        .generatePoToken(videoId).blockingGet()
                }

                return@synchronized Quadruple(
                    webPoTokenGenerator!!,
                    webPoTokenVisitorData!!,
                    webPoTokenStreamingPot!!,
                    shouldRecreate
                )
            }


        if (BuildConfig.DEBUG) {
            Log.d(
                TAG,
                "poToken for $videoId: playerPot=$streamingPot, " +
                        "streamingPot=$streamingPot, visitor_data=$visitorData"
            )
        }

        return PoTokenResult(visitorData, streamingPot, streamingPot)
    }

    override fun getWebEmbedClientPoToken(videoId: String): PoTokenResult? = null

    override fun getAndroidClientPoToken(videoId: String): PoTokenResult? = null

    override fun getIosClientPoToken(videoId: String): PoTokenResult? = null
}
