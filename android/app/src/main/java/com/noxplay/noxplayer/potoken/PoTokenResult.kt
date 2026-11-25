package com.noxplay.noxplayer.potoken

/**
 * @param visitorData session identifier the streaming token is bound to
 * @param playerRequestPoToken content token, minted from the video id
 * @param streamingDataPoToken session token, minted from [visitorData]
 */
data class PoTokenResult(
    val visitorData: String,
    val playerRequestPoToken: String,
    val streamingDataPoToken: String,
)
