package com.noxplay.noxplayer

import android.app.Application
import android.content.res.Configuration
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactHost
import com.facebook.react.ReactPackage
import com.facebook.react.common.ReleaseLevel
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.otahotupdate.OtaHotUpdate
import com.nativenoxmodule.NativeNoxModulePackage
import com.nativenoxmodule.NativeWidgetModulePackage
import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ExpoReactHostFactory

class MainApplication : Application(), ReactApplication {

    fun getJSBundleFile(): String {
        val sharedPref = this@MainApplication.getSharedPreferences(
            "com.noxplay.noxplayer.APMSettings", MODE_PRIVATE)
        if (sharedPref.getBoolean("safemode", false)) {
            Log.d("APM", "launching in safe mode")
            with (sharedPref.edit()) {
                putBoolean("safemode", false)
                apply()
            }
            return "assets://index.android.bundle"
        }
        return OtaHotUpdate.bundleJS(this@MainApplication)
    }

    override val reactHost: ReactHost by lazy {
        ExpoReactHostFactory.getDefaultReactHost(
            context = applicationContext,
            packageList =
                PackageList(this).packages.apply {
                    // Packages that cannot be autolinked yet can be added manually here, for example:
                    // add(MyReactNativePackage())
                    add(NativeNoxModulePackage())
                    add(NativeWidgetModulePackage())
                },
            jsBundleFilePath = getJSBundleFile(),
            jsMainModulePath = ".expo/.virtual-metro-entry"
        )
    }

    override fun onCreate() {
        super.onCreate()
        try {
//          DefaultNewArchitectureEntryPoint.releaseLevel = ReleaseLevel.valueOf(BuildConfig.REACT_NATIVE_RELEASE_LEVEL.uppercase())
        } catch (e: IllegalArgumentException) {
          DefaultNewArchitectureEntryPoint.releaseLevel = ReleaseLevel.STABLE
        }
        DefaultNewArchitectureEntryPoint.releaseLevel = ReleaseLevel.STABLE

        loadReactNative(this)
        ApplicationLifecycleDispatcher.onApplicationCreate(this)
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
    }
}
