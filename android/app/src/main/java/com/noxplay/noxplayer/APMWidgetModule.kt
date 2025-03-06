package com.noxplay.noxplayer

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import androidx.core.net.toUri

class APMWidgetModule (private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "APMWidgetModule"

    @ReactMethod fun updateWidget() {
        val intent = Intent(reactContext, APMWidget::class.java)
        intent.action = "android.appwidget.action.APPWIDGET_UPDATE"
        val widgetManager = AppWidgetManager.getInstance(reactContext)
        val ids = widgetManager.getAppWidgetIds(ComponentName(reactContext, APMWidget::class.java))
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
        reactContext.sendBroadcast(intent)
    }

    @ReactMethod fun setWidgetBackground(uri: String?) {
        val intent = Intent(reactContext, APMWidget::class.java)
        intent.action = WIDGET_SET_BKGD
        intent.data = uri?.toUri()
        val widgetManager = AppWidgetManager.getInstance(reactContext)
        val ids = widgetManager.getAppWidgetIds(ComponentName(reactContext, APMWidget::class.java))
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
        reactContext.sendBroadcast(intent)
    }
}
