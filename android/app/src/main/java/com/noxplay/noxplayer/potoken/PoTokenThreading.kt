package com.noxplay.noxplayer.potoken

import android.os.Handler
import android.os.Looper

internal object PoTokenThreading {
    fun runOnMainThread(block: () -> Unit) {
        if (Looper.myLooper() == Looper.getMainLooper()) {
            block()
        } else if (!Handler(Looper.getMainLooper()).post(block)) {
            throw PoTokenException("Could not run on main thread")
        }
    }
}
