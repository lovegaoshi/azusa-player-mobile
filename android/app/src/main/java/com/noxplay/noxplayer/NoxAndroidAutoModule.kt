package com.noxplay.noxplayer

import android.app.ActivityManager
import android.app.ApplicationExitInfo
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.view.WindowManager
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod


class NoxAndroidAutoModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "NoxAndroidAutoModule"

  @ReactMethod fun getLastExitReason(callback: Promise) {
    try {
      val activity = reactApplicationContext.currentActivity
      val am = activity?.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        val reason = am.getHistoricalProcessExitReasons("com.noxplay.noxplayer",0,0)[0].reason
        callback.resolve(reason in intArrayOf(
          ApplicationExitInfo.REASON_USER_REQUESTED,
          ApplicationExitInfo.REASON_USER_STOPPED,
          ApplicationExitInfo.REASON_EXIT_SELF,
          ApplicationExitInfo.REASON_PERMISSION_CHANGE
        ))
      } else {
        callback.resolve(true)
      }
    } catch (e: Exception) {
      callback.resolve(true)
    }
  }

  @ReactMethod fun disableShowWhenLocked() {
    val activity = reactApplicationContext.currentActivity
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      activity?.setShowWhenLocked(false)
      activity?.setTurnScreenOn(false)
    }
  }
  @ReactMethod fun getDrawOverAppsPermission(callback: Promise) {
    val context = reactApplicationContext
    val activity = context.currentActivity
    callback.resolve(Settings.canDrawOverlays(activity))
  }

  @ReactMethod fun askDrawOverAppsPermission() {
    val context = reactApplicationContext
    val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:com.noxplay.noxplayer"))
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    context.startActivity(intent)
  }

  @ReactMethod fun keepScreenOn(screenOn: Boolean = true) {
    val context = reactApplicationContext
    val activity = context.currentActivity
    val window = activity?.window
    if (screenOn) {
      window?.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    } else {
      window?.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    }
  }

  @ReactMethod fun isGestureNavigationMode(callback: Promise) {
    val context = reactApplicationContext
    callback.resolve(Settings.Secure.getInt(context.contentResolver, "navigation_mode", 0) == 2)
  }
}
