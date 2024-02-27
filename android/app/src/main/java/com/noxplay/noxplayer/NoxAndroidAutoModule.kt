package com.noxplay.noxplayer

import android.app.ActivityManager
import android.app.ApplicationExitInfo
import android.content.ContentUris
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import android.provider.Settings
import android.util.Log
import android.view.WindowManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableNativeArray


class NoxAndroidAutoModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "NoxAndroidAutoModule"

  private fun _listMediaDir(relativeDir: String, subdir: Boolean, selection: String? = null): WritableArray {
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
      Log.e("NoxFileUtil", e.toString())
    }
    return results
  }

  @ReactMethod fun listMediaDir(relativeDir: String, subdir: Boolean, callback: Promise) {
    callback.resolve(_listMediaDir(relativeDir, subdir))
  }

  @ReactMethod fun listMediaFileByFName(filename: String, callback: Promise) {
    callback.resolve(_listMediaDir("", true,
      "${MediaStore.Audio.Media.DISPLAY_NAME} IN ('$filename')"))
  }

  @ReactMethod fun listMediaFileByID(id: String, callback: Promise) {
    callback.resolve(_listMediaDir("", true,
      "${MediaStore.Audio.Media._ID} = $id"))
  }
  @ReactMethod fun getLastExitReason(callback: Promise) {
    try {
      val activity = reactApplicationContext.currentActivity
      val am = activity?.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        val reason = am.getHistoricalProcessExitReasons(
          "com.noxplay.noxplayer",0,0
        )[0].reason
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
    val intent = Intent(
      Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
      Uri.parse("package:com.noxplay.noxplayer")
    )
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
    callback.resolve(
      Settings.Secure.getInt(context.contentResolver, "navigation_mode", 0) == 2
    )
  }
}
