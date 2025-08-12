package com.nativenoxmodule

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Intent
import androidx.core.net.toUri
import com.facebook.react.bridge.ReactApplicationContext
import com.noxplay.noxplayer.APMWidget
import com.noxplay.noxplayer.WIDGET_SET_BKGD

class NativeWidgetModule(reactContext: ReactApplicationContext) : NativeWidgetModuleSpec(reactContext) {

    override fun getName() = NAME
    override fun updateWidget() {
        val reactContext = reactApplicationContext
        val intent = Intent(reactContext, APMWidget::class.java)
        intent.action = "android.appwidget.action.APPWIDGET_UPDATE"
        val widgetManager = AppWidgetManager.getInstance(reactContext)
        val ids = widgetManager.getAppWidgetIds(ComponentName(reactContext, APMWidget::class.java))
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
        reactContext.sendBroadcast(intent)
    }

    override fun setWidgetBackground(uri: String?) {
        val reactContext = reactApplicationContext
        val intent = Intent(reactContext, APMWidget::class.java)
        intent.action = WIDGET_SET_BKGD
        intent.data = uri?.toUri()
        val widgetManager = AppWidgetManager.getInstance(reactContext)
        val ids = widgetManager.getAppWidgetIds(ComponentName(reactContext, APMWidget::class.java))
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
        reactContext.sendBroadcast(intent)
    }


    companion object {
        const val NAME = "NativeWidgetModule"
    }
}