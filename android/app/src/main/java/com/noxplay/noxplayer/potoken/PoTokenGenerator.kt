package com.noxplay.noxplayer.potoken

import android.content.Context
import java.io.Closeable

/** A WebView-backed BotGuard generator that can mint tokens for multiple identifiers. */
internal interface PoTokenGenerator : Closeable {
    /**
     * Mints a token using the integrity token and webPoSignalOutput obtained during initialization.
     * May be called multiple times.
     */
    fun generatePoToken(identifier: String): String

    /** Epoch milliseconds after which all tokens produced by this generator are invalid. */
    val expirationMs: Long

    /** Visitor id parsed from the homepage, used as a fallback if /visitor_id fails. */
    val homepageVisitorData: String?

    interface Factory {
        fun newPoTokenGenerator(context: Context): PoTokenGenerator
    }
}

internal interface PoTokenCallback {
    fun onToken(token: String)
    fun onError(error: Throwable)
}
