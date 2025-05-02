package com.noxplay.noxplayer

import android.annotation.SuppressLint
import android.app.AlarmManager
import android.app.PendingIntent
import android.app.PictureInPictureParams
import android.content.ComponentCallbacks2
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.res.Configuration
import android.os.Build
import android.os.Bundle
import android.os.Debug
import android.os.SystemClock
import android.util.Rational
import com.facebook.infer.annotation.Assertions
import android.view.View
import android.view.ViewTreeObserver
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.bridgelessEnabled
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import expo.modules.ReactActivityDelegateWrapper
import timber.log.Timber

interface NoxActivity {
    var loadedRN: Boolean
}

class MainActivity(override var loadedRN: Boolean = BuildConfig.DEBUG) :
    ReactActivity(), ComponentCallbacks2, NoxActivity {


    fun emit (tag: String, data: Bundle) {
        getReactContext()?.emitDeviceEvent(tag, Arguments.fromBundle(data))
    }
    private lateinit var volumeListener: APMVolumeListener
    /**
     * for react navigation;
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(null)
        volumeListener = APMVolumeListener(::emit)
        registerReceiver(volumeListener, IntentFilter("android.media.VOLUME_CHANGED_ACTION"))

        val content: View = findViewById(android.R.id.content)
        content.viewTreeObserver.addOnPreDrawListener(
            object : ViewTreeObserver.OnPreDrawListener {
                override fun onPreDraw(): Boolean {
                    // Check whether the initial data is ready.
                    return if (loadedRN) {
                        // The content is ready. Start drawing.
                        content.viewTreeObserver.removeOnPreDrawListener(this)
                        true
                    } else {
                        // The content isn't ready. Suspend.
                        false
                    }
                }
            }
        )
    }

    @SuppressLint("VisibleForTests")
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        try {
            if (intent.action?.contains("android.media.action.MEDIA_PLAY_FROM_SEARCH") == true) {
                getReactContext()?.emitDeviceEvent("remote-play-search", Arguments.fromBundle(intent.extras ?: Bundle()))
            }
            val launchOptions = Bundle()
            launchOptions.putString("intentData", intent.dataString)
            launchOptions.putString("intentAction", intent.action)
            launchOptions.putBundle("intentBundle", intent.extras ?: Bundle())
            getReactContext()?.emitDeviceEvent("APMNewIntent", Arguments.fromBundle(launchOptions))
        } catch (e: Exception) {
            Timber.tag("APM-intent").d("failed to notify intent: $intent")
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
            launchOptions.putString("intentAction", mActivity.intent.action ?: "")
            if (mActivity.intent.dataString == "safemode") {
                val sharedPref = mActivity.getSharedPreferences(
                    "com.noxplay.noxplayer.APMSettings", MODE_PRIVATE)
                with (sharedPref.edit()) {
                    putBoolean("safemode", true)
                    apply()
                }
            }
            // launchOptions.putBundle("intentBundle", mActivity.intent.extras ?: Bundle())
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
            getReactContext()?.emitDeviceEvent("APMEnterPIP", true)
            // HACK: a really stupid way to continue RN UI rendering
            onResume()
        } else {
            // Restore the full-screen UI.
            getReactContext()?.emitDeviceEvent("APMEnterPIP", false)
        }
        super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig)
    }

    private fun logAPMRAM() {
        val nativeHeapSize = Debug.getNativeHeapSize()
        val nativeHeapFreeSize = Debug.getNativeHeapFreeSize()
        val usedMemInBytes = nativeHeapSize - nativeHeapFreeSize
        val usedMemInPercentage = usedMemInBytes * 100 / nativeHeapSize
        Timber.tag("APMRAM").d("APM RAM usage: ${usedMemInBytes/1000/1000}MB ($usedMemInPercentage)")
    }

    override fun onTrimMemory(level: Int) {
        Timber.tag("APMRAMTrim").d("trim memory level $level emitted.")
        logAPMRAM()
        super.onTrimMemory(level)
    }

    override fun onLowMemory() {
        Timber.tag("APMRAMLow").d("low system memory emitted.")
        logAPMRAM()
        super.onLowMemory()
    }

    override fun onDestroy() {
        unregisterReceiver(volumeListener)
        // https://stackoverflow.com/questions/5764099/how-to-update-a-widget-if-the-related-service-gets-killed
        val am = getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(this, APMWidget::class.java)
        intent.action = WIDGET_CLEAR
        am.set(
            AlarmManager.ELAPSED_REALTIME,
            SystemClock.elapsedRealtime(),
            PendingIntent.getBroadcast(this, 5424, intent, PendingIntent.FLAG_IMMUTABLE)
        )
        super.onDestroy()
    }

    @SuppressLint("VisibleForTests")
    fun getReactContext(): ReactContext? {

        if (bridgelessEnabled) {
            val reactApplication = this.application as ReactApplication
            val reactHost = reactApplication.reactHost
            Assertions.assertNotNull(reactHost, "React host is null in newArchitecture")
            return reactHost?.currentReactContext
        }
        return reactInstanceManager.currentReactContext
    }
}
