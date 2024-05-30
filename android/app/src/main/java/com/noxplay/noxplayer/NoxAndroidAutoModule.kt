package com.noxplay.noxplayer

import android.annotation.SuppressLint
import android.app.ActivityManager
import android.app.ApplicationExitInfo
import android.content.ContentUris
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import android.provider.Settings
import android.view.WindowManager
import androidx.core.content.FileProvider
import com.doublesymmetry.kotlinaudio.utils.bitmapCoverDir
import com.doublesymmetry.kotlinaudio.utils.bitmapCoverFileName
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableNativeArray
import timber.log.Timber
import java.io.File


class NoxAndroidAutoModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "NoxAndroidAutoModule"

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

  @ReactMethod fun getUri(uri: String, callback: Promise) {
    callback.resolve(FileProvider.getUriForFile(reactApplicationContext,
      "${BuildConfig.APPLICATION_ID}.provider", File(uri)).toString())
  }

  @ReactMethod fun listMediaDir(relativeDir: String, subdir: Boolean, callback: Promise) {
    callback.resolve(listMediaDirNative(relativeDir, subdir))
  }

  @ReactMethod fun listMediaFileByFName(filename: String, callback: Promise) {
    callback.resolve(listMediaDirNative("", true,
      "${MediaStore.Audio.Media.DISPLAY_NAME} IN ('$filename')"))
  }

  @ReactMethod fun listMediaFileByID(id: String, callback: Promise) {
    callback.resolve(listMediaDirNative("", true,
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
          ApplicationExitInfo.REASON_PERMISSION_CHANGE,
          ApplicationExitInfo.REASON_PACKAGE_UPDATED,
          ApplicationExitInfo.REASON_EXCESSIVE_RESOURCE_USAGE,
          ApplicationExitInfo.REASON_LOW_MEMORY,
          ApplicationExitInfo.REASON_SIGNALED,
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
    try {
      callback.resolve(Settings.canDrawOverlays(activity))
    } catch (e: Exception) {
      callback.resolve(false)
    }
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

  @SuppressLint("Range")
  private fun getAPMCacheUriNative(contentUri: Uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI): Uri? {
    val contentResolver = reactApplicationContext.contentResolver
    val selection = "${MediaStore.MediaColumns.RELATIVE_PATH}=?"
    val selectionArgs = arrayOf(bitmapCoverDir)
    val cursor = contentResolver.query(contentUri, null, selection,selectionArgs,null)
    if (cursor != null && cursor.count > 0) {
      while (cursor.moveToNext()) {
        val filename = cursor.getString(cursor.getColumnIndex(MediaStore.MediaColumns.DISPLAY_NAME))
        if (filename == bitmapCoverFileName) {
          val id = cursor.getLong(cursor.getColumnIndex(MediaStore.MediaColumns._ID))
          cursor.close()
          return ContentUris.withAppendedId(contentUri, id)
        }
      }
      cursor.close()
    }
    return null
  }

  @ReactMethod fun getAPMCacheUri(callback: Promise) {
    callback.resolve(getAPMCacheUriNative())
  }
}
