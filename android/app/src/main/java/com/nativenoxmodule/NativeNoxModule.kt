package com.nativenoxmodule

import android.app.ActivityManager
import android.app.ApplicationExitInfo
import android.app.UiModeManager
import android.content.ContentUris
import android.content.Context
import android.content.Context.UI_MODE_SERVICE
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import android.provider.Settings
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.content.FileProvider
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableNativeArray
import com.noxplay.noxplayer.BuildConfig
import com.noxplay.noxplayer.MainActivity
import timber.log.Timber
import java.io.File

class NativeNoxModule(reactContext: ReactApplicationContext) : NativeNoxModuleSpec(reactContext) {

    override fun getName() = NAME

    private fun getActivity(): MainActivity? {
        return reactApplicationContext.currentActivity as MainActivity?
    }


    private fun listMediaDirNative(relativeDir: String, subdir: Boolean, selection: String? = null): WritableArray {
        val results: WritableArray = WritableNativeArray()
        try {
            val query = reactApplicationContext.contentResolver.query(
                MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
                arrayOf(
                    MediaStore.Audio.Media._ID,
                    MediaStore.Audio.Media.RELATIVE_PATH,
                    MediaStore.Audio.Media.DISPLAY_NAME,
                    MediaStore.Audio.Media.DATA,
                    MediaStore.Audio.Media.TITLE,
                    MediaStore.Audio.Media.ALBUM,
                    MediaStore.Audio.Media.ARTIST,
                    MediaStore.Audio.Media.BITRATE,
                    MediaStore.Audio.Media.DURATION,
                ), selection,null, null)
            query?.use { cursor ->
                val pathColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.RELATIVE_PATH)
                while (cursor.moveToNext()) {
                    val mediaPath = cursor.getString(pathColumn)
                    if (mediaPath == relativeDir || (subdir && mediaPath.startsWith(relativeDir))) {
                        val mediaItem = Arguments.createMap()
                        mediaItem.putString("URI",
                            "content:/" + ContentUris.appendId(
                                Uri.Builder().path(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI.path),
                                cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID))).build().toString())
                        mediaItem.putString("relativePath",mediaPath)
                        mediaItem.putString("fileName",
                            cursor.getString(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DISPLAY_NAME))
                        )
                        mediaItem.putString("realPath",
                            cursor.getString(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DATA))
                        )
                        mediaItem.putString("title",
                            cursor.getString(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE))
                        )
                        mediaItem.putString("album",
                            cursor.getString(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM))
                        )
                        mediaItem.putString("artist",
                            cursor.getString(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST))
                        )
                        mediaItem.putInt("duration",
                            cursor.getInt(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION))
                        )
                        mediaItem.putInt("bitrate",
                            cursor.getInt(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.BITRATE))
                        )
                        results.pushMap(mediaItem)
                    }
                }
            }
        } catch (e: Exception) {
            Timber.tag("NoxFileUtil").e(e.toString())
        }
        return results
    }

    override fun getUri(uri: String?): String {
        return FileProvider.getUriForFile(reactApplicationContext,
            "${BuildConfig.APPLICATION_ID}.provider", File(uri!!)
        ).toString()
    }

    override fun listMediaDir(relativeDir: String?, subdir: Boolean): WritableArray {
        return listMediaDirNative(relativeDir!!, subdir)
    }

    override fun listMediaFileByFName(filename: String?, relativeDir: String?): WritableArray {
        return listMediaDirNative(relativeDir!!, true,
            "${MediaStore.Audio.Media.DISPLAY_NAME} IN ('$filename')")
    }

    override fun listMediaFileByID(id: String?): WritableArray {
        return listMediaDirNative("", true,
            "${MediaStore.Audio.Media._ID} = $id")
    }

    override fun loadRN() {
        val activity = getActivity()
        activity?.loadedRN = true
    }

    override fun isRNLoaded(): Boolean {
        val activity = getActivity()
        Timber.tag("APM").d("probing if RN is loaded: ${activity?.loadedRN}")
        return activity?.loadedRN ?: true
    }

    override fun getLastExitCode(): Double {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                val activity = getActivity()
                val am = activity?.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
                return am.getHistoricalProcessExitReasons(
                    BuildConfig.APPLICATION_ID,0,0
                )[0].reason.toDouble()
            }
        } catch (e: Exception) {
            Timber.tag("APMLastExitCode").d(e)
        }
        return 0.0
    }

    override fun getLastExitReason(): Boolean {
        try {
            val activity = getActivity()
            val am = activity?.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                val reason = am.getHistoricalProcessExitReasons(
                    BuildConfig.APPLICATION_ID,0,0
                )[0].reason
                return reason in intArrayOf(
                    ApplicationExitInfo.REASON_USER_REQUESTED,
                    ApplicationExitInfo.REASON_USER_STOPPED,
                    ApplicationExitInfo.REASON_EXIT_SELF,
                    ApplicationExitInfo.REASON_PERMISSION_CHANGE,
                    ApplicationExitInfo.REASON_PACKAGE_UPDATED,
                    ApplicationExitInfo.REASON_EXCESSIVE_RESOURCE_USAGE,
                    ApplicationExitInfo.REASON_LOW_MEMORY,
                    ApplicationExitInfo.REASON_SIGNALED,
                )
            }
        } catch (_: Exception) {
        }
        return true
    }

    override fun isGestureNavigationMode(): Boolean {
        val context = reactApplicationContext

        return Settings.Secure.getInt(context.contentResolver, "navigation_mode", 0) == 2

    }

    override fun selfDestruct() {
        val activity = getActivity()
        Timber.tag("NoxModule").w("self destructing!!!")
        activity?.finish()
        android.os.Process.killProcess(android.os.Process.myPid())
    }

    override fun setDarkTheme(mode: Double) {
        val activity = getActivity()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val ui = activity?.getSystemService(UI_MODE_SERVICE) as UiModeManager?
            ui?.setApplicationNightMode(mode.toInt())
        } else {
            AppCompatDelegate.setDefaultNightMode(mode.toInt())
        }
    }

    companion object {
        const val NAME = "NativeNoxModule"
    }
}