package com.noxplay.noxplayer

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.os.Bundle

class APMVolumeListener(val emit: (t: String, b: Bundle) -> Unit): BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        if (intent?.action == "android.media.VOLUME_CHANGED_ACTION" &&
            intent.extras?.getInt("android.media.EXTRA_VOLUME_STREAM_TYPE") == AudioManager.STREAM_MUSIC) {
            emit("APMVolume", Bundle().apply { putInt("volume",
                intent.extras?.getInt("android.media.EXTRA_VOLUME_STREAM_VALUE") ?: -1
            )})
        }
    }
}