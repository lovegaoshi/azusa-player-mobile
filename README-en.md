<p align="center"><a href="https://github.com/kenmingwang/azusa-player"><img width="200" src="https://github.com/kenmingwang/azusa-player/blob/master/public/img/logo2-01.png?raw=true"></a></p>

<p align="center">
  <a href="https://github.com/lovegaoshi/azusa-player-mobile/releases/latest">
    <img alt="GitHub release (latest by date)" src="https://github.com/lovegaoshi/azusa-player-mobile/actions/workflows/android-weekly.yml/badge.svg?branch=master">
  </a>
  <a href="https://github.com/lovegaoshi/azusa-player-mobile/releases/latest">
    <img alt="GitHub release (latest by date)" src="https://github.com/lovegaoshi/azusa-player-mobile/actions/workflows/ios-weekly.yml/badge.svg?branch=master">
  </a>
</p>
  
<p align="center">
  <a href="https://github.com/lovegaoshi/azusa-player-mobile/releases/latest">
    <img alt="GitHub all releases" src="https://img.shields.io/github/downloads/lovegaoshi/azusa-player-mobile/latest/total">
  </a>
  <a href="https://github.com/lovegaoshi/azusa-player-mobile/releases/latest">
    <img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/lovegaoshi/azusa-player-mobile">
  </a>  
</p>

<p align="center"> 
  <a href='https://play.google.com/store/apps/details?id=com.noxplay.noxplayer&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'><img alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png' height="80"/></a>
<a href="https://f-droid.org/packages/com.noxplay.noxplayer">
    <img src="https://fdroid.gitlab.io/artwork/badge/get-it-on-zh-cn.png"
    alt="下载应用，请到 F-Droid"
    height="80">
</a>
</p>

<h3 align="center" style="color:purple">Azusa-Player-Mobile / 电梓播放器手机版</h3>
<h4 align="center" style="color:purple">A 3rd party Bilibili audio player / 一个Bilibili第三方音频播放器</h4>


# Intro

APM is the missing music player client to Bilibili like YTMusic to YT. No shenanigans, only music.

Check out the [chrome extension](https://github.com/lovegaoshi/NoxPlayer) version as well! 

# Features

- retro UI/UX inspired by TTPlayer and AIMP
- strips audio stream from bilibili videos
- playlist focused music organization
- supports bilibili URL, YT, Alist, local files (android)
- playlist auto update
- customizable UI, live background
- cloud based playlist syncing across devices and to/from extension
- i18n support
- bilibili login
- caching and downloading
- Android Auto, Carplay support
- ffmpeg powered decoding and OTF r128gain parsing
- AB repeat
- karaoke lyric
- fade transition and crossfade
- beat match phrasing
- musicfree plugin support

# Install

Android users can download apk from [release](https://github.com/lovegaoshi/azusa-player-mobile/releases/latest), install on [f-droid](https://f-droid.org/packages/com.noxplay.noxplayer) or [google play](https://play.google.com/store/apps/details?id=com.noxplay.noxplayer).

iOS users can download and sideload ipa from release.

# Development

APM is proudly open-source and welcomes contributions. Please refer to [github actions](https://github.com/lovegaoshi/NoxPlayer/actions) for any compiling issues - if github can do it, so can you.

iOS dev quick start:

```
git clone https://github.com/lovegaoshi/azusa-player-mobile.git
yarn
yarn build
cd ios && pod install && cd ..
cp ios/sentry.properties.example ios/sentry.properties
yarn start
```

## Sponsor

**This project uses free icon assets from [Icons8.com](https://icons8.com/).**


CDN acceleration and security protection for this project are sponsored by Tencent EdgeOne.


![https://edgeone.ai/media/34fe3a45-492d-4ea4-ae5d-ea1087ca7b4b.png](https://edgeone.ai/media/34fe3a45-492d-4ea4-ae5d-ea1087ca7b4b.png)


Thank you for considering supporting APM. All donation proceedings will go towards a copy of Buldur's Gate III (or until BG3 goes on sale for $30)

<p align="center"><a href="https://github.com/lovegaoshi/azusa-player-mobile"><img width="200" src="https://github.com/lovegaoshi/azusa-player-mobile/blob/5795492b49048046b36583502f74caa9fdb2badb/docs/docs/usage-tutorial/images/sponsor.jpg"></a></p>

## Licensing

APM uses GPL/LGPL libraries, thus is released under AGPLv3
