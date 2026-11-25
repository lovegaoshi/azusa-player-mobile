package com.noxplay.noxplayer.potoken

import android.content.Context
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.annotation.MainThread
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewFeature
import timber.log.Timber
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.regex.Pattern

/**
 * WebView-based V2 BotGuard generator (SmartTube's `PoTokenWebView4`), based on
 * Brainicism/bgutil-ytdlp-pot-provider. No V8/J2V8 runtime is involved: the BotGuard VM runs in the
 * system WebView with network loads disabled, and all HTTP requests are made by Kotlin/OkHttp.
 */
internal class PoTokenWebView private constructor(
    context: Context,
    private val onInitDone: () -> Unit,
) : PoTokenGenerator {
    private val webView = WebView(context)
    private val poTokenEmitters = mutableListOf<Pair<String, PoTokenCallback>>()
    private var initError: Throwable? = null
    private var closed = false

    @Volatile
    override var homepageVisitorData: String? = null
        private set

    override var expirationMs: Long = -1
        private set

    init {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        setSafeBrowsingEnabled(settings, false)
        settings.userAgentString = USER_AGENT
        // The VM is injected as a string; the WebView never needs network access itself.
        settings.blockNetworkLoads = true
        webView.addJavascriptInterface(this, JS_INTERFACE)

        webView.webChromeClient =
            object : WebChromeClient() {
                override fun onConsoleMessage(message: ConsoleMessage): Boolean {
                    if (message.message().contains("Uncaught")) {
                        val text = message.message().removePrefix("Uncaught (in promise) ")
                        val formatted = "\"$text\", source: ${message.sourceId()} (${message.lineNumber()})"
                        Timber.tag(TAG).e("This WebView implementation is broken: %s", formatted)
                        runCatching {
                            onInitializationErrorCloseAndCancel(BadWebViewException(formatted))
                        }
                    }
                    return super.onConsoleMessage(message)
                }
            }
    }

    private fun setSafeBrowsingEnabled(settings: WebSettings, enabled: Boolean) {
        if (!WebViewFeature.isFeatureSupported(WebViewFeature.SAFE_BROWSING_ENABLE)) return
        try {
            WebSettingsCompat.setSafeBrowsingEnabled(settings, enabled)
        } catch (e: AbstractMethodError) {
            // Some Android 8/9 WebView implementations do not implement this method.
            Timber.tag(TAG).w(e, "Cannot toggle safe browsing")
        }
    }

    private fun loadHtmlAndObtainBotguard(context: Context) {
        val html =
            context.assets.open(ASSET_NAME).bufferedReader().use { it.readText() }
        webView.loadDataWithBaseURL(
            "https://www.youtube.com",
            html.replaceFirst("</script>", "\n$JS_INTERFACE.downloadAndRunBotguard()</script>"),
            "text/html",
            "utf-8",
            null,
        )
    }

    /** Called by the injected snippet once the BotGuard HTML has been parsed. */
    @JavascriptInterface
    fun downloadAndRunBotguard() {
        try {
            val (challenge, ytcfg) =
                getChallengeFromHomepage()
                    ?: getLegacyChallengeData()
                    ?: throw PoTokenException("Could not obtain a BotGuard challenge")

            PoTokenThreading.runOnMainThread {
                webView.evaluateJavascript(
                    """try {
                        if ($ytcfg) {
                            yt = { config_: $ytcfg };
                            window.yt = yt;
                        }
                        runBotGuard($challenge).then(function (result) {
                            webPoSignalOutput = result.webPoSignalOutput;
                            if (!webPoSignalOutput.length)
                                $JS_INTERFACE.onJsInitializationError("webPoSignalOutput is empty");
                            else
                                $JS_INTERFACE.onRunBotguardResult(result.botguardResponse);
                        }, function (error) {
                            $JS_INTERFACE.onJsInitializationError(error + "\n" + error.stack);
                        });
                    } catch (error) {
                        $JS_INTERFACE.onJsInitializationError(error + "\n" + error.stack);
                    }""",
                    null,
                )
            }
        } catch (t: Throwable) {
            onJsInitializationError(t.message ?: t.toString())
        }
    }

    /**
     * Preferred challenge source: the homepage's `ytcfg` + `window.ytAtN` pair. BotGuard reads
     * `yt.config_.EVENT_ID`, so a challenge obtained from /att/get alone may be rejected.
     */
    private fun getChallengeFromHomepage(): Pair<String, String?>? {
        val pageHtml =
            try {
                PoTokenHttp.get(
                    "https://www.youtube.com",
                    mapOf(
                        "Accept" to "*/*",
                        "Accept-Language" to "en-US,en;q=0.7",
                        "x-goog-api-key" to GOOGLE_API_KEY,
                        "x-user-agent" to "grpc-web-javascript/0.1",
                    ),
                )
            } catch (t: Throwable) {
                Timber.tag(TAG).w(t, "Could not fetch the YouTube homepage")
                return null
            }

        val ytcfg = extractYtcfg(pageHtml)
        if (ytcfg != null) {
            homepageVisitorData = extractVisitorData(ytcfg)
        }

        val attMatcher =
            Pattern
                .compile("""window\.ytAtN\(\s*(\{[\s\S]*?\})\s*\)""")
                .matcher(pageHtml)
        if (!attMatcher.find()) {
            Timber.tag(TAG).w("Homepage has no ytAtN challenge")
            return null
        }

        val rawChallenge = parseLooseJSON(attMatcher.group(1)!!)["R"]
        if (rawChallenge == null ||
            !rawChallenge.contains("bgChallenge") ||
            !rawChallenge.contains("program") ||
            !rawChallenge.contains("interpreterUrl")
        ) {
            Timber.tag(TAG).w("Homepage ytAtN payload has no bgChallenge")
            return null
        }

        return try {
            parseDescrambledChallengeData(rawChallenge) to ytcfg
        } catch (t: Throwable) {
            Timber.tag(TAG).w(t, "Could not parse the homepage challenge")
            null
        }
    }

    /** Legacy fallback when the homepage does not expose a usable challenge. */
    private fun getLegacyChallengeData(): Pair<String, String?>? {
        val body =
            """{"context":{"client":{"clientName":"WEB","clientVersion":"$WEB_CLIENT_VERSION"}},"engagementType":"ENGAGEMENT_TYPE_UNBOUND"}"""
        val responseBody =
            try {
                PoTokenHttp.post(
                    "https://www.youtube.com/youtubei/v1/att/get?prettyPrint=false",
                    body,
                    mapOf(
                        "Content-Type" to "application/json",
                        "x-goog-api-key" to GOOGLE_API_KEY,
                        "x-user-agent" to "grpc-web-javascript/0.1",
                    ),
                )
            } catch (t: Throwable) {
                Timber.tag(TAG).w(t, "Could not obtain /att/get challenge")
                return null
            }

        return try {
            parseDescrambledChallengeData(responseBody) to null
        } catch (t: Throwable) {
            Timber.tag(TAG).w(t, "Could not parse the /att/get challenge")
            null
        }
    }

    @JavascriptInterface
    fun onJsInitializationError(error: String) {
        onInitializationErrorCloseAndCancel(buildExceptionForJsError(error))
    }

    /** Called with the BotGuard snapshot response once the VM has run. */
    @JavascriptInterface
    fun onRunBotguardResult(botguardResponse: String) {
        try {
            val responseBody =
                PoTokenHttp.post(
                    "https://www.youtube.com/api/jnn/v1/GenerateIT",
                    "[ \"$REQUEST_KEY\", \"$botguardResponse\" ]",
                    mapOf(
                        "x-goog-api-key" to GOOGLE_API_KEY,
                        "x-user-agent" to "grpc-web-javascript/0.1",
                    ),
                )
            val (integrityToken, expirationTimeInSeconds) = parseIntegrityTokenData(responseBody)
            // Leave a 10 minute safety margin.
            expirationMs = System.currentTimeMillis() + ((expirationTimeInSeconds - 600) * 1_000)

            PoTokenThreading.runOnMainThread {
                webView.evaluateJavascript(
                    """try {
                        getMinter = webPoSignalOutput[0];
                        mintCallback = getMinter($integrityToken);
                        if (typeof mintCallback !== 'function') {
                            $JS_INTERFACE.onJsInitializationError("mintCallback is not defined");
                        } else {
                            $JS_INTERFACE.onJsInitializationDone($expirationTimeInSeconds);
                        }
                        webPoSignalOutput = null;
                        getMinter = null;
                    } catch (error) {
                        $JS_INTERFACE.onJsInitializationError(error + "\n" + error.stack);
                    }""",
                    null,
                )
            }
        } catch (t: Throwable) {
            onJsInitializationError(t.message ?: t.toString())
        }
    }

    @JavascriptInterface
    fun onJsInitializationDone(expirationTimeInSeconds: Long) {
        Timber.tag(TAG).d("initialization finished, expiration=${expirationTimeInSeconds}s")
        onInitDone()
    }

    override fun generatePoToken(identifier: String): String {
        initError?.let { throw it }

        val latch = CountDownLatch(1)
        var token: String? = null
        var generationError: Throwable? = null
        addPoTokenEmitter(
            identifier,
            object : PoTokenCallback {
                override fun onToken(value: String) {
                    token = value
                    latch.countDown()
                }

                override fun onError(error: Throwable) {
                    generationError = error
                    latch.countDown()
                }
            },
        )

        val u8Identifier = stringToU8(identifier)
        PoTokenThreading.runOnMainThread {
            webView.evaluateJavascript(
                """try {
                    poTokenU8 = obtainPoToken($u8Identifier);
                    poTokenU8String = "";
                    for (i = 0; i < poTokenU8.length; i++) {
                        if (i != 0) poTokenU8String += ",";
                        poTokenU8String += poTokenU8[i];
                    }
                    $JS_INTERFACE.onObtainPoTokenResult("$identifier", poTokenU8String);
                    poTokenU8 = null;
                    poTokenU8String = null;
                } catch (error) {
                    $JS_INTERFACE.onObtainPoTokenError("$identifier", error + "\n" + error.stack);
                }""",
                null,
            )
        }

        if (!latch.await(10, TimeUnit.SECONDS)) {
            popPoTokenEmitter(identifier)
            throw PoTokenException("Timed out generating poToken for $identifier")
        }
        generationError?.let { throw it }
        initError?.let { throw it }
        return token ?: throw PoTokenException("No poToken generated for $identifier")
    }

    @JavascriptInterface
    fun onObtainPoTokenResult(identifier: String, poTokenU8: String) {
        try {
            popPoTokenEmitter(identifier)?.onToken(u8ToBase64(poTokenU8))
        } catch (t: Throwable) {
            popPoTokenEmitter(identifier)?.onError(t)
        }
    }

    @JavascriptInterface
    fun onObtainPoTokenError(identifier: String, error: String) {
        val exception =
            buildExceptionForJsError("onObtainPoTokenError: identifier=$identifier error=$error")
        popPoTokenEmitter(identifier)?.onError(exception)
            ?: onInitializationErrorCloseAndCancel(exception)
    }

    private fun addPoTokenEmitter(identifier: String, callback: PoTokenCallback) {
        synchronized(poTokenEmitters) { poTokenEmitters.add(identifier to callback) }
    }

    private fun popPoTokenEmitter(identifier: String): PoTokenCallback? =
        synchronized(poTokenEmitters) {
            val index = poTokenEmitters.indexOfFirst { it.first == identifier }
            if (index >= 0) poTokenEmitters.removeAt(index).second else null
        }

    private fun popAllPoTokenEmitters(): List<Pair<String, PoTokenCallback>> =
        synchronized(poTokenEmitters) {
            val emitters = poTokenEmitters.toList()
            poTokenEmitters.clear()
            emitters
        }

    private fun onInitializationErrorCloseAndCancel(error: Throwable) {
        if (initError != null) return
        initError = error
        popAllPoTokenEmitters().forEach { (_, callback) -> runCatching { callback.onError(error) } }
        PoTokenThreading.runOnMainThread {
            close()
            onInitDone()
        }
    }

    @MainThread
    override fun close() {
        if (closed) return
        closed = true
        webView.clearHistory()
        webView.clearCache(true)
        webView.loadUrl("about:blank")
        webView.onPause()
        webView.removeAllViews()
        webView.destroy()
    }

    companion object : PoTokenGenerator.Factory {
        private const val TAG = "PoTokenWebView"
        private const val ASSET_NAME = "po_token2.html"
        private const val JS_INTERFACE = "PoTokenWebView"
        private const val GOOGLE_API_KEY = "AIzaSyDyT5W0Jh49F30Pqqtyfdf7pDLFKLJoAnw"
        private const val REQUEST_KEY = "O43z0dpjhgX20SCx4KAo"
        private const val WEB_CLIENT_VERSION = "2.20260907.06.00"
        private const val USER_AGENT =
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36(KHTML, like Gecko)"

        override fun newPoTokenGenerator(context: Context): PoTokenGenerator {
            val latch = CountDownLatch(1)
            var generatorRef: PoTokenWebView? = null
            var initError: Throwable? = null

            PoTokenThreading.runOnMainThread {
                val created =
                    try {
                        PoTokenWebView(context) { latch.countDown() }
                    } catch (t: Throwable) {
                        initError = BadWebViewException("${t::class.simpleName}: ${t.message}")
                        latch.countDown()
                        return@runOnMainThread
                    }
                generatorRef = created
                try {
                    created.loadHtmlAndObtainBotguard(context)
                } catch (t: Throwable) {
                    initError = BadWebViewException("${t::class.simpleName}: ${t.message}")
                    runCatching { created.close() }
                    latch.countDown()
                }
            }

            if (!latch.await(20, TimeUnit.SECONDS)) {
                generatorRef?.let { runCatching { it.close() } }
                throw PoTokenException("$TAG: failed to initialize within the specified time")
            }
            initError?.let { throw it }
            val generator = generatorRef ?: throw PoTokenException("$TAG: generator was not created")
            generator.initError?.let { throw it }
            return generator
        }

        private fun extractYtcfg(pageHtml: String): String? {
            val matcher =
                Pattern
                    .compile("""ytcfg\.set\((\{.+?\})\);""", Pattern.DOTALL)
                    .matcher(pageHtml)
            return if (matcher.find()) matcher.group(1) else null
        }

        private fun extractVisitorData(ytcfg: String): String? {
            val matcher =
                Pattern
                    .compile(""""VISITOR_DATA"\s*:\s*"([^"]+)"""")
                    .matcher(ytcfg)
            return if (matcher.find()) matcher.group(1) else null
        }
    }
}
