package com.noxplay.noxplayer

import android.os.Build
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
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

}
