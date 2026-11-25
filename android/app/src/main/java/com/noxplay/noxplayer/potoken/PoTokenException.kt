package com.noxplay.noxplayer.potoken

/**
 * Failure while obtaining a proof-of-origin token.
 *
 * Ported from SmartTube's potokennp2 implementation, which is itself based on
 * Brainicism's bgutil-ytdlp-pot-provider.
 */
open class PoTokenException(message: String) : RuntimeException(message)

/** Thrown when the system WebView cannot execute the BotGuard JavaScript. */
class BadWebViewException(message: String) : PoTokenException(message)

fun buildExceptionForJsError(error: String): PoTokenException =
    if (error.contains("SyntaxError")) BadWebViewException(error) else PoTokenException(error)
