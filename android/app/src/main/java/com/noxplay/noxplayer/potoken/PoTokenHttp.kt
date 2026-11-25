package com.noxplay.noxplayer.potoken

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

/** Small OkHttp helper for the BotGuard/Innertube requests made outside the WebView. */
internal object PoTokenHttp {
    private const val TIMEOUT_SECONDS = 20L
    private val CONTENT_TYPE = "application/json+protobuf".toMediaType()

    private val client =
        OkHttpClient.Builder()
            .connectTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .readTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .writeTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .build()

    fun get(url: String, headers: Map<String, String> = emptyMap()): String = request(url, null, headers)

    fun post(url: String, body: String, headers: Map<String, String> = emptyMap()): String =
        request(url, body, headers)

    private fun request(url: String, body: String?, headers: Map<String, String>): String {
        val requestBuilder = Request.Builder().url(url)
        headers.forEach { (name, value) -> requestBuilder.header(name, value) }
        if (body != null) {
            requestBuilder.post(body.toRequestBody(CONTENT_TYPE))
        }

        client.newCall(requestBuilder.build()).execute().use { response ->
            val responseBody = response.body?.string()
            if (!response.isSuccessful || responseBody.isNullOrEmpty()) {
                throw PoTokenException("Invalid response code: ${response.code}")
            }
            return responseBody
        }
    }
}
