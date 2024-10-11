package com.noxplay.noxplayer

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.util.Log
import android.widget.RemoteViews
import com.doublesymmetry.trackplayer.model.Track
import com.doublesymmetry.trackplayer.module.MusicEvents
import com.doublesymmetry.trackplayer.service.MusicService
import com.lovegaoshi.kotlinaudio.models.AudioPlayerState

/**
 * Implementation of App Widget functionality.
 */
class APMWidget : AppWidgetProvider() {

    private lateinit var binder: MusicService.MusicBinder
    private var currentTrack: Track? = null

    private fun bindService (context: Context?): Boolean {
        if (!::binder.isInitialized || !binder.isBinderAlive) {
            if (context == null) return false
            Log.d("APM", "widget attempt to connect to MusicService...")
            val mBinder = peekService(context, Intent(context, MusicService::class.java)) ?: return false
            Log.d("APM", "widget attempt to cast to MusicService...")
            binder = mBinder as MusicService.MusicBinder
            if (!binder.isBinderAlive) return false
        }
        return true
    }

    private fun emit(context: Context?, e: String) {
        if (!bindService(context)) return
        binder.service.emit(e)
    }

    private fun initWidget(views: RemoteViews, context: Context): RemoteViews {
        views.setOnClickPendingIntent(
            R.id.buttonPrev, PendingIntent.getBroadcast(
                context, 0,
                Intent(context, APMWidget::class.java).setAction(MusicEvents.BUTTON_SKIP_PREVIOUS),
                PendingIntent.FLAG_IMMUTABLE))
        views.setOnClickPendingIntent(
            R.id.buttonPlay, PendingIntent.getBroadcast(
                context, 0,
                Intent(context, APMWidget::class.java).setAction(MusicEvents.BUTTON_PLAY_PAUSE),
                PendingIntent.FLAG_IMMUTABLE))
        views.setOnClickPendingIntent(
            R.id.buttonNext, PendingIntent.getBroadcast(
                context, 0,
                Intent(context, APMWidget::class.java).setAction(MusicEvents.BUTTON_SKIP_NEXT),
                PendingIntent.FLAG_IMMUTABLE))
        views.setOnClickPendingIntent(
            R.id.APMWidget, PendingIntent.getBroadcast(
                context, 0,
                Intent(context, APMWidget::class.java).setAction(WIDGET_CLICK),
                PendingIntent.FLAG_IMMUTABLE))
        return views
    }

    private fun updateTrack(views: RemoteViews, track: Track?, bitmap: Bitmap?): RemoteViews {
        if (track == null) {
            views.setTextViewCompoundDrawables(
                R.id.buttonPlay, R.drawable.media3_icon_play,0,0,0)
        }
        views.setTextViewText(R.id.songName, track?.title ?: "")
        views.setTextViewText(R.id.artistName, track?.artist ?: "")
        views.setImageViewBitmap(R.id.albumArt, bitmap)
        return views
    }

    private fun updatePlayPause(views: RemoteViews) {
        val isPlaying = binder.service.state === AudioPlayerState.PLAYING
        views.setTextViewCompoundDrawables(
            R.id.buttonPlay,
            if (isPlaying) R.drawable.media3_icon_pause else R.drawable.media3_icon_play,
            0,0,0)
    }

    // HACK: properly abstract all of these
    private fun clearWidgetContent(context: Context?) {
        if (context == null) return
        val widgetManager = AppWidgetManager.getInstance(context)
        val ids = widgetManager.getAppWidgetIds(ComponentName(context, APMWidget::class.java))
        val views = RemoteViews(context.packageName, R.layout.a_p_m_widget)
        updateTrack(views, null, null)
        ids.forEach { id -> widgetManager.updateAppWidget(id, views) }
        // onUpdate(context, widgetManager, ids)
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        // Construct the RemoteViews object
        val views = RemoteViews(context.packageName, R.layout.a_p_m_widget)
        if (!bindService(context)) {
            updateTrack(views, null, null)
        } else {
            initWidget(views, context)
            updatePlayPause(views)
            val track = binder.service.currentTrack
            if (track != currentTrack) {
                currentTrack = track
                val bitmap = if (binder.service.currentBitmap.size == 1) binder.service.currentBitmap[0] else null
                updateTrack(views, currentTrack, bitmap)
            }
        }
        // Instruct the widget manager to update the widget
        for (appWidgetId in appWidgetIds) {
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }

    override fun onReceive(context: Context?, intent: Intent?) {
        try {
            when (intent?.action) {
                "clear-widget" -> clearWidgetContent(context)
                WIDGET_CLICK -> {
                    if (!bindService(context)) {
                        Intent(context, MainActivity::class.java).apply {
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }.also {i -> context?.startActivity(i)}
                        return
                    }
                }
                MusicEvents.BUTTON_SKIP_PREVIOUS -> emit(context, MusicEvents.BUTTON_SKIP_PREVIOUS)
                MusicEvents.BUTTON_SKIP_NEXT -> emit(context, MusicEvents.BUTTON_SKIP_NEXT)
                MusicEvents.BUTTON_PLAY_PAUSE -> emit(context, MusicEvents.BUTTON_PLAY_PAUSE)
                else -> {}
            }
        } catch (e: Exception) {
            Log.w("APM", "widget action ${intent?.action} failed by $e")

        }
        super.onReceive(context, intent)
    }

    override fun onEnabled(context: Context) {
        // Enter relevant functionality for when the first widget is created
    }

    override fun onDisabled(context: Context) {
        // Enter relevant functionality for when the last widget is disabled
    }
}

const val WIDGET_CLICK = "widget-click"
const val WIDGET_CLEAR = "clear-widget"