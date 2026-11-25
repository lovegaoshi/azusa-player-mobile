package com.noxplay.noxplayer.potoken

import com.grack.nanojson.JsonParser
import timber.log.Timber

/** Fetches a WEB visitor id, matching SmartTube's VisitorService request. */
internal object PoTokenVisitor {
    private const val TAG = "PoTokenVisitor"
    private const val VISITOR_URL = "https://www.youtube.com/youtubei/v1/visitor_id"
    private const val CLIENT_VERSION = "2.20250213.05.00"
    private const val USER_AGENT =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0"

    fun getVisitorData(): String? =
        try {
            val body =
                """{"context":{"client":{"clientName":"WEB","clientVersion":"$CLIENT_VERSION","hl":"en","gl":"US"}},"user":{"enableSafetyMode":false,"lockedSafetyMode":false},"racyCheckOk":true,"contentCheckOk":true}"""
            val response =
                PoTokenHttp.post(
                    VISITOR_URL,
                    body,
                    mapOf(
                        "Content-Type" to "application/json",
                        "Accept-Language" to "en-US, en;q=0.9",
                        "Cookie" to "SOCS=CAE=",
                        "Origin" to "https://www.youtube.com",
                        "Referer" to "https://www.youtube.com",
                        "User-Agent" to USER_AGENT,
                        "X-Youtube-Client-Name" to "1",
                        "X-Youtube-Client-Version" to CLIENT_VERSION,
                    ),
                )
            JsonParser.`object`().from(response).getObject("responseContext")?.getString("visitorData")
        } catch (t: Throwable) {
            Timber.tag(TAG).w(t, "Could not obtain visitorData")
            null
        }
}
