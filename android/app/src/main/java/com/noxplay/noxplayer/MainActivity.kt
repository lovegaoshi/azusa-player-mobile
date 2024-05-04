package com.noxplay.noxplayer

import android.annotation.SuppressLint
import android.app.PictureInPictureParams
import android.content.Intent
import android.content.res.Configuration
import android.os.Build
import android.os.Bundle
import android.util.Rational
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.Arguments
import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
    /**
     * for react navigation;
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(null)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        }
        if ("trackplayer://service-bound" in intent.data.toString()) {
            moveTaskToBack(true)
        }
    }

  @SuppressLint("VisibleForTests")
  override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    if (intent !== null) {
      val launchOptions = Bundle()
      launchOptions.putString("intentData", intent.dataString)
      launchOptions.putString("intentAction", intent.action)
      launchOptions.putBundle("intentBundle", intent.extras)
      this.reactInstanceManager.currentReactContext
        ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        ?.emit("APMNewIntent", Arguments.fromBundle(launchOptions))
    }
  }
    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String {
        return "azusa-player-mobile"
    }

    class APMReactActivityDelegate(activity: ReactActivity, componentName: String):
        DefaultReactActivityDelegate(activity, componentName, fabricEnabled) {
            private val mActivity = activity

            override fun onCreate(savedInstanceState: Bundle?) {
              super.onCreate(savedInstanceState)
            }

            override fun getLaunchOptions(): Bundle {
              val launchOptions = super.getLaunchOptions() ?: Bundle()
              launchOptions.putString("intentData", mActivity.intent.dataString)
              launchOptions.putString("intentAction", mActivity.intent.action)
              launchOptions.putBundle("intentBundle", mActivity.intent.extras)
              return launchOptions
            }
        }

    /**
     * Returns the instance of the [ReactActivityDelegate]. Here we use a util class [ ] which allows you to easily enable Fabric and Concurrent React
     * (aka React 18) with two boolean flags.
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return ReactActivityDelegateWrapper(
            this, BuildConfig.IS_NEW_ARCHITECTURE_ENABLED, APMReactActivityDelegate(
            this,
                   mainComponentName,  // If you opted-in for the New Architecture, we enable the Fabric Renderer.
                )
        )
    }

    override fun onStart() {
        super.onStart()
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            return
        }
        val params = PictureInPictureParams.Builder()
            .setAspectRatio(Rational(239, 100))
            .setSeamlessResizeEnabled(false)
            .setAutoEnterEnabled(true)
            .build()
        setPictureInPictureParams(params)
    }

    @SuppressLint("VisibleForTests")
    override fun onPictureInPictureModeChanged(
        isInPictureInPictureMode: Boolean,
        newConfig: Configuration
    ) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }
        if (isInPictureInPictureMode) {
            // Hide the full-screen UI (controls, etc.) while in PiP mode.
            this.reactInstanceManager.currentReactContext
                ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("APMEnterPIP", true)
            // HACK: a really stupid way to continue RN UI rendering
            onResume()
        } else {
            // Restore the full-screen UI.
            reactInstanceManager.currentReactContext
                ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("APMEnterPIP", false)
        }
        super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig)
    }
}
