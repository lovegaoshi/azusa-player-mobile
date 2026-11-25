package com.noxplay.noxplayer.potoken

import android.util.Log
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith

/** Prints the generated poToken for a video id supplied as an instrumentation argument. */
@RunWith(AndroidJUnit4::class)
class PoTokenPrintTest {
    @Test
    fun printPoToken() {
        val videoId =
            InstrumentationRegistry.getArguments().getString("videoId")?.takeIf { it.isNotBlank() }
                ?: throw AssertionError(
                    "Missing video id. Run with -PpotVideoId=VIDEO_ID",
                )

        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val result = PoTokenProvider(context).getPOToken(videoId)
        assertNotNull("Could not obtain a poToken for $videoId", result)

        val token = result!!
        val output =
            buildString {
                appendLine("videoId=$videoId")
                appendLine("visitorData=${token.visitorData}")
                appendLine("playerRequestPoToken=${token.playerRequestPoToken}")
                appendLine("streamingDataPoToken=${token.streamingDataPoToken}")
            }
        Log.i(TAG, output)
        println(output)

        assertTrue(token.playerRequestPoToken.isNotBlank())
        assertTrue(token.streamingDataPoToken.isNotBlank())
    }

    private companion object {
        const val TAG = "PoTokenPrintTest"
    }
}
