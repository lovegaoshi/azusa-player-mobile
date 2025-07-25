package com.noxplay.noxplayer

import android.app.Application
import android.content.res.Configuration
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader
import expo.modules.ReactNativeHostWrapper
import com.otahotupdate.OtaHotUpdate
import com.nativenoxmodule.NativeNoxModulePackage
import expo.modules.ApplicationLifecycleDispatcher

class MainApplication : Application(), ReactApplication {
    override val reactNativeHost: ReactNativeHost =
        ReactNativeHostWrapper(this, object : DefaultReactNativeHost(this) {


            override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages.apply {
                    // Packages that cannot be autolinked yet can be added manually here, for example:
                    // add(MyReactNativePackage())
                    add(NativeNoxModulePackage())
                }

            override fun getJSMainModuleName(): String = "index"
            override fun getJSBundleFile(): String {
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
            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
        })


    override val reactHost: ReactHost
        get() = ReactNativeHostWrapper.createReactHost(applicationContext, reactNativeHost)

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this,  OpenSourceMergedSoMapping)
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            // If you opted-in for the New Architecture, we load the native entry point for this app.
            load()
        }
        ApplicationLifecycleDispatcher.onApplicationCreate(this)
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
    }
}
