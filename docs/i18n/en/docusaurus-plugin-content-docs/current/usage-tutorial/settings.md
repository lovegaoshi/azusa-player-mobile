---
sidebar_position: 3
---

# Settings

## General

- Automatic Subscription: every day when entering a playlist and the playlist has subscription URLs set in the playlist setting, APM will attempt to scan the URLs and add newly disccovered songs to the playlist.

- Parse Song Name: APM has handwritten regexp rules to extract songnames from uploaders by their preferred naming scheme. With this on the song names will be automatically extracted by these rules.

- Play Searched Playlist: when searching in a playlist and a song is played from the searched results, APM will only assign the current playing list as the searched list. Otherwise APM will play the entire list.

- No Album Art: APM will not show album art ONLY at the main player screen. Many times album arts would rather be hidden to show the theme background, as most album arts from bilibili or YTB are awefully cropped because they were designed to a 16:9 resolution, not a square.

- Fast Bili Search: Because Bilibili videos may contain episodes, each video needs to be separately resolved and causing a significant delay in search queries. By disabling this while the search results are not quite accurate, it sure is fast.

## Player Skin

APM has a light (Azusa) and a dark (Nox) skin built-in. Users may define their own skins via a JSON file. Unfortunately all files need to be hosted online as I don't want to have to request file read permission just for this.

## Bilibili Login

APM supports two login methods: QR code scan and manual input. Manual input is currently the preferred method that user would need to provide the SESSDATA and bili_jct key. This is best achived by using MS Phonelink so that computer and phone will share the clipboard, making this a copy-paste job. QR code login currently has some problems with authentication that some features may not be supported (such as favoriting and liking a video).

Once logged in the user may log out or sync their favorite lists by pressing the Login.SyncBiliFavList button.

## Playlist Backup/Restore

APM supports playlist backup and restore via dropbox and private cloud. APM's playlist is compressed to save bandwith, in tern it does require some processing time.

In addition APM's playlist restore is cross compatible with Noxplayer (the extension version) to some degree, and vice versa.

## Change Language

APM's language support is powered by i18n.

## Developer Options

APM
