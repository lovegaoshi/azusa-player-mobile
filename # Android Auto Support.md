# Android Auto Support

Make sure to read through [Google's guidelines](https://developer.android.com/training/cars/media) before adding Android Auto support to your RNTP app! Not all features in the article are implemented so PRs are always welcome.

See the example app and Podverse's PR as examples adding Android Auto support to an existing RNTP app.

## Using RN < 0.71?

You may need to manually edit HeadlessJsMediaService.java to make it compatible with your current RN version. See [Podverse's RNTP fork](https://github.com/lovegaoshi/react-native-track-player/tree/dev-podverse-aa) that uses RN 0.66.

## Necessary Declarations

Enable Google voice assistant permissions (must be implemented per Google's AA guidelines) in your project's AndroidManifest.xml by adding this below:

```
            <intent-filter>
                <action android:name="android.media.action.MEDIA_PLAY_FROM_SEARCH" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
```

Then add Android Auto declarations as so:

```
        <meta-data android:name="com.google.android.gms.car.application"
            android:resource="@xml/automotive_app_desc"/>
```

Make `automotive_app_desc.xml` under your project's `android/src/main/res/xml` with the content below:

```
<automotiveApp>
    <uses name="media"/>
</automotiveApp>
```

Lastly enable any app to show in Android Auto via Settings -> Apps -> Android Auto -> In-App Notification Settings -> vertical dot on the top right corner -> Developer Settings -> Unknown Sources. This is necessary for any app not in the play store yet.

This will immediately enable your RNTP app to have synced media control in Android Auto.

## Content Hierarchy

Android Auto can show `playable` (songs) and `browsable` (playlists) `MediaItem`s. These MediaItems are organized like a tree structure, starting from the root branching out. In addition, `browsable` MediaItems at the root level will become tabs shown at the top. AA supports a maximum of 4 tabs.

`MediaItem` must have a `Title`, `mediaID` and `playable` field. In addition, `Subtitle` (artist) and `iconUri` (album art) can be specified.

AA content hierarchy is a dict with `mediaID`s as keys and a list of `MediaItem`s as values. See the demo hierarchy here.

## Fetching Contents

Contents can be refreshed by repeatly calling TrackPlayer.setBrowseTree. Sometimes you do not want to load your contents all at once to the browseTree, say because it's quite heavy on internet connections. You may programmatically load data via `Event.RemoteBrowse` that returns the browsable mediaItem's `mediaID` a user has clicked. Then you can update content as above and AA will work as so. See Podverse.

Because content refresh triggers MediaBrowserService.notifyChildrenChange, this effectively triggers RemoteBrowse again; there is evidence all tabs are triggered this way, not leaves. so if you do not set a caching system to prevent this from loading, add a debounce check. But do not use a debounce hook. See Podverse.

## Event Callback

Android Auto requires 3 events to be handled: `Event.RemotePlayId` `Event.RemotePlaySearch` and `Event.RemoteSkip`. `Event.RemotePlayId` is emitted when users click playable items in AA's content hierarchy. `Event.RemotePlaySearch` is emitted when users use google voice assistant in Android Auto, which must be implemented per Google's AA guidelines. `Event.RemoteSkip` is responsible for playback from users clicking in the "queue" list from the top right corner. This should be handled as `TrackPlayer.skip(event.index).then(() => TrackPlayer.play());`.

## Headless Start

Android Auto only starts the MediaBrowserCompactService, not the activity of your app. RNTP itself does separate its Service (MusicService) from Activity (RN App), however because RNTP has to be initialized in the RN side, technically it is not possible to start Android Auto without starting the RN Activity. With a native android app, one would refactor all logic into MusicService and leave Activity only showing the UI, but this is not possible for RN apps. There are workarounds:

You must enable some way to start activity from a background service. The easiest one is to enable android.permission.SYSTEM_ALERT_WINDOW and ask your users to enable "draw over other apps." This will trigger the app to start whenever Service is created (which is at app start and Android Auto start when app is stopped) and automatically bring your app to the front.

You may also have noticed Android Activities cannot start when the screen is locked/off. This is an intended behavior of Android. The workaround is to enable in AndroidManifest.xml

```
            android:showOnLockScreen="true"
            android:turnScreenOn="true"
```

or add this in the onCreate function of RNActivity:

```
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true);
      setTurnScreenOn(true);
    }
```

This allows the RN Activity to overlay on top of the lock screen and start itself normally. However now the activity will always stay on top of the lock screen, meaning this app can be now used without unlocking. To work around this again, create a native module call to turn it off after your app is fully initialized.

```
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(false);
      setTurnScreenOn(false);
    }
```

## Known Issues

JumpForward and JumpBackward will not show on Android <13 devices. To resolve this, implement these buttons as CustomActions, just like how they are handled under Android >=13. You need to implement changes in KotlinAudio. Note this will introduce [duplicate custom actions buttons](https://github.com/doublesymmetry/react-native-track-player/issues/1970) so more patches are needed. Alternatively set your app's minimumSdk to 33.

## For Podverse

Podverse's RNTP has a few customizations, but mostly are due to Podverse using not the nightly but v4 rc4, and wont be necessary once updated to nightly (after AA PR is merged).

### KotlinAudio

Podverse's fork is based on v2.0.0rc7 which is used by RNTP v4 rc4. This features changes of 1. [the Android Auto PR](https://github.com/doublesymmetry/KotlinAudio/pull/88) 2. [Improve metadata handling](https://github.com/doublesymmetry/KotlinAudio/pull/70) 3. [progress not getting set patch](https://github.com/doublesymmetry/react-native-track-player/issues/2120) 4. [re-enable custom actions](https://github.com/doublesymmetry/KotlinAudio/commit/2ce674981312fd9fbead0663320f886a6dd7dba4). 5. custom patch for [duplicate custom actions buttons](https://github.com/doublesymmetry/react-native-track-player/issues/1970).

### RNTP

Podverse's RNTP fork is based on v4 rc4 with the AA PR and custom actions PR. Note HeadlessJsMediaService.java is slightly modified to accomodate RN 0.66.
