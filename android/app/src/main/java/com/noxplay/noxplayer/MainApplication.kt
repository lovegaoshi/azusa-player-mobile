package com.noxplay.noxplayer

import android.app.Application
import android.content.res.Configuration
import android.net.Uri
import android.provider.MediaStore
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import com.microsoft.codepush.react.CodePush
import expo.modules.ApplicationLifecycleDispatcher.onApplicationCreate
import expo.modules.ApplicationLifecycleDispatcher.onConfigurationChanged
import expo.modules.ReactNativeHostWrapper

class MainApplication : Application(), ReactApplication {
    override val reactNativeHost: ReactNativeHost =
        ReactNativeHostWrapper(this, object : DefaultReactNativeHost(this) {
            // 2. Override the getJSBundleFile method in order to let
            // the CodePush runtime determine where to get the JS
            // bundle location from on each app start
            override fun getJSBundleFile(): String? {
                return CodePush.getJSBundleFile()
            }

            override fun getUseDeveloperSupport(): Boolean {
                return BuildConfig.DEBUG
            }

            override fun getPackages(): List<ReactPackage> {
                val packages: MutableList<ReactPackage> = PackageList(this).packages
                // Packages that cannot be autolinked yet can be added manually here, for example:
                // packages.add(new MyReactNativePackage());
                packages.add(NoxPackage())
                return packages
            }

            override fun getJSMainModuleName(): String {
                return "index"
            }

            override val isNewArchEnabled: Boolean
                get() = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled: Boolean
                get() = BuildConfig.IS_HERMES_ENABLED
        })

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this,  /* native exopackage */false)
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            // If you opted-in for the New Architecture, we load the native entry point for this app.
            load()
        }
        val uri = Uri.parse("content://com.android.externalstorage.documents/document/primary%3AMusic")
        Log.d("RNTP", MediaStore.Audio.Media.getContentUri(
          MediaStore.VOLUME_EXTERNAL
        ).toString())
      Log.d("RNTP", MediaStore.Audio.Media.getContentUri(
        MediaStore.VOLUME_INTERNAL
      ).toString())
        val query = this.contentResolver.query(
          MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
          arrayOf(
            MediaStore.Audio.Media._ID,
            MediaStore.Audio.Media.RELATIVE_PATH,
            MediaStore.Audio.Media.DISPLAY_NAME
            ), null,null, null)
        query?.use { cursor ->
          Log.d("RNTP", cursor.count.toString())
          val idColumn = cursor.getColumnIndexOrThrow(MediaStore.Video.Media._ID)
          val pathColumn = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.RELATIVE_PATH)
          val nameColumn = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DISPLAY_NAME)
            while (cursor.moveToNext()) {
              Log.d("RNTP", cursor.getString(idColumn) + cursor.getString(pathColumn) + cursor.getString(nameColumn))
            }
        }
        onApplicationCreate(this)
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        onConfigurationChanged(this, newConfig)
    }
}
