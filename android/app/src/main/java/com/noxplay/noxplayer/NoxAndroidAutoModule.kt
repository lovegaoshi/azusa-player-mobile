package com.noxplay.noxplayer

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod


class NoxAndroidAutoModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "NoxAndroidAutoModule"
  @RequiresApi(Build.VERSION_CODES.O_MR1)
  @ReactMethod fun disableShowWhenLocked() {
    val activity = reactApplicationContext.currentActivity;
    activity?.setShowWhenLocked(false);
    activity?.setTurnScreenOn(false);
  }
  @ReactMethod fun getDrawOverAppsPermission(callback: Promise) {
    val context = reactApplicationContext;
    val activity = context.currentActivity;
    callback.resolve(Settings.canDrawOverlays(activity));
  }

  @ReactMethod fun askDrawOverAppsPermission() {
    val context = reactApplicationContext;
    val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:com.noxplay.noxplayer"));
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    context.startActivity(intent);
  }

}
