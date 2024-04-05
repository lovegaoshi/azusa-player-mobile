# Azusa-player-mobile

<p align="center"><a href="https://github.com/kenmingwang/azusa-player"><img width="200" src="https://github.com/kenmingwang/azusa-player/blob/master/public/img/logo2-01.png?raw=true"></a></p>

<p align="center">
  <a href="https://github.com/lovegaoshi/azusa-player-mobile/releases">
    <img alt="GitHub release (latest by date)" src="https://github.com/lovegaoshi/azusa-player-mobile/actions/workflows/android-weekly.yml/badge.svg?branch=master">
  </a>
  <a href="https://github.com/lovegaoshi/azusa-player-mobile/releases">
    <img alt="GitHub all releases" src="https://img.shields.io/github/downloads/lovegaoshi/azusa-player-mobile/total">
  </a>
  <a href="https://github.com/lovegaoshi/azusa-player-mobile/releases">
    <img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/lovegaoshi/azusa-player-mobile">
  </a>
  
</p>

<h3 align="center" style="color:purple">Azusa-Player-Mobile / 电梓播放器手机版</h3>
<h4 align="center" style="color:purple">A 3rd party Bilibili audio player / 一个Bilibili第三方音频播放器</h4>

<div align="center">
<a href="https://github.com/lovegaoshi/azusa-player-mobile#%E9%A1%B9%E7%9B%AE%E7%AE%80%E4%BB%8B">项目简介</a><a href="https://github.com/lovegaoshi/azusa-player-mobile#"></a>&nbsp;&nbsp;&nbsp;<a href="https://github.com/lovegaoshi/azusa-player-mobile#安装">安装</a>&nbsp;&nbsp;&nbsp;<a href="https://github.com/lovegaoshi/azusa-player-mobile#界面">界面</a>&nbsp;&nbsp;&nbsp;<a href="https://github.com/lovegaoshi/azusa-player-mobile#捐助">捐助</a>   
</div>

## 项目简介

- 是真正意义上的手机版《[电梓播放器](https://github.com/kenmingwang/azusa-player/releases)》(?): Azusa-Player！
- 本质上是个 b 站第三方**音频在线播放器**，是插件版[电梓播放器](https://github.com/kenmingwang/azusa-player) 和[电闹播放器](https://github.com/lovegaoshi/azusa-player)的忠实移植；对标油管音乐，去除歌单推荐功能~2023年不会还有人用b站推荐听歌吧~，交互仿造AIMP，复古简约。
  - 由于浏览器地八哥轻松简便并且我手机流量捉急，主要功能依然会在插件版[电闹播放器](https://github.com/lovegaoshi/azusa-player)优先更新
- 目的是想让视频**轻量化**为音频，方便溜歌/歌单分类/下载等
- b站视频链接，部分油管视频链接，steria.vplayer.tk
- 歌单订阅更新
- 歌名提取与歌词搜索
- 换皮和自制皮肤
- 歌单云备份、与插件版电闹播放器伪互通
- b站登录互动，点赞，三连，增加b站视频播放量
- 多语言
- 歌曲缓存
- Android Auto支持
- ffmpeg powered 音量均衡
- AB 重复
- **切片 man 不易，没有各位切片 man 也不会有这个项目的意义，请大家溜歌同时点右下方的点赞按钮点赞和三连 👍**
- 自用为主要目的，不感兴趣的 feature 大概不会做，有问题可以[b 站私信](https://message.bilibili.com/#/whisper/mid1989881)

**This project uses free icon assets from [Icons8.com](https://icons8.com/).**

## 为什么要使用管人播放器？

市面上有很多播放器竞品，比如整合大量音乐网站，跨平台的[~listen1~](https://github.com/listen1/listen1_chrome_extension)、[~洛雪音乐~](https://github.com/lyswhut/lx-music-mobile)、[musicfree](https://github.com/maotoumao/MusicFree)；动画elegent的[namida](https://github.com/namidaco/namida)；界面简洁好使的本地播放器[AIMP](https://www.aimp.ru/)；支持b站的也不是没有，为什么要用管人播放器？

- 管人播放器之初为了溜阿梓歌切收藏夹而诞生，自从持久、稳定、每日投分p的第五代阿梓切歌人[HonmaMeiko](https://space.bilibili.com/590096/video?tid=0&keyword=&order=pubdate)接棒后，以及[自动切歌软件](https://www.bilibili.com/video/BV1WK411y7zW/?spm_id_from=333.999.0.0)研发成功可以大批量无人值守切各种没人切的管人歌势，管人播放器开发了对b站视频列表的支持，以及订阅b站链接的功能，专注于解决b站视频分p搜索孱弱，整合视频分p、视频列表、视频合集、收藏夹、空间~b站产品经理脑门被夹了搞这么多一样的玩意儿~等多种视频列表为一个统一的歌单。由于b站音乐区本身流量不足~依托答辩~，大多整合类播放器对于b站的支持很基础，并没有管人播放器类别支持广，没有订阅功能，也不整合b站增加播放量、点赞等操作。
- 管人播放器支持歌单订阅。
- 管人播放器给管人痴定制皮肤。
- 管人播放器绑ffmpeg做OTF音量均衡.
- 管人播放器有业界领先的React Native Android Auto适配。

## 安装

安卓用户在右边的release下载最新版本apk。

苹果用户在右边的release下载最新版本ipa。然后[按这个方法](https://zhuanlan.zhihu.com/p/99397647)安装。大概。

我知道 APM 在 iOS 模拟器上像垃圾一样运行。但我不尊重 Apple 用户，也不会满足任何 iOS 生活质量要求。但Nek（[b 站私信](https://message.bilibili.com/#/whisper/mid1989881)）会。

## 使用

请参考[电闹播放器的介绍](https://www.bilibili.com/video/BV1bv4y1p7K4/?spm_id_from=333.999.0.0)。

有问题？在issues下留言。

## 界面

<p float="left">
<img alt="GitHub all releases" src="https://github.com/lovegaoshi/azusa-player-mobile/blob/3958211a07617d8e15e4be56da984dbd53d7e9fb/docs/docs/usage-tutorial/images/Screenshot_20230606_142623_APM.jpg" width=270>
<img alt="GitHub all releases" src="https://github.com/lovegaoshi/azusa-player-mobile/blob/3958211a07617d8e15e4be56da984dbd53d7e9fb/docs/docs/usage-tutorial/images/Screenshot_20230606_142629_APM.jpg" width=270>
<img alt="GitHub all releases" src="https://github.com/lovegaoshi/azusa-player-mobile/blob/3958211a07617d8e15e4be56da984dbd53d7e9fb/docs/docs/usage-tutorial/images/Screenshot_20230606_142636_APM.jpg" width=270>
<img alt="GitHub all releases" src="https://github.com/lovegaoshi/azusa-player-mobile/blob/3958211a07617d8e15e4be56da984dbd53d7e9fb/docs/docs/usage-tutorial/images/Screenshot_20230606_142655_APM.jpg" width=270>
<img alt="GitHub all releases" src="https://github.com/lovegaoshi/azusa-player-mobile/blob/3958211a07617d8e15e4be56da984dbd53d7e9fb/docs/docs/usage-tutorial/images/Screenshot_20230606_142941_APM.jpg" width=270>
<img alt="GitHub all releases" src="https://github.com/lovegaoshi/azusa-player-mobile/blob/3958211a07617d8e15e4be56da984dbd53d7e9fb/docs/docs/usage-tutorial/images/Screenshot_20230606_143018_APM.jpg" width=270>
</p>

APM 有横屏适配！

<p align="center"><a href="https://github.com/lovegaoshi/azusa-player-mobile"><img src="https://github.com/lovegaoshi/azusa-player-mobile/blob/a89c26ac561a9e6431066e6c0c79cb689e9f19b4/docs/docs/usage-tutorial/images/wsa-landscape.png"></a></p>

## 开发

ios开发需要XCode。安卓开发需要android studio。

```
git clone https://github.com/lovegaoshi/azusa-player-mobile.git
yarn build
yarn
cd ios && pod install && cd ..
```

### MF插件

APM偷偷做了MusicFree插件适配。你可以参考MusicFree插件编写，然后放到你自己编译的APM里用，如果你太痴迷管人只想用APM的话。

## 捐助

感谢你对中国管人事业的支持。您赞助的每一分钱将用于购买《博德之门3》。

<p align="center"><a href="https://github.com/lovegaoshi/azusa-player-mobile"><img width="200" src="https://github.com/lovegaoshi/azusa-player-mobile/blob/5795492b49048046b36583502f74caa9fdb2badb/docs/docs/usage-tutorial/images/sponsor.jpg"></a></p>

## Licenses of used dependencies

[Azusa-player](https://github.com/kenmingwang/azusa-player): MIT

[@react-native-async-storage/async-storage](https://github.com/react-native-async-storage/async-storage): MIT

[@react-native-community/slider](https://github.com/callstack/react-native-slider): MIT

[@react-native-cookies/cookies](https://github.com/react-native-cookies/cookies): MIT

[@react-navigation/drawer](https://github.com/react-navigation/react-navigation): [MIT](https://github.com/react-navigation/react-navigation/blob/main/packages/native/LICENSE)

[@react-navigation/material-top-tabs](https://github.com/react-navigation/react-navigation): [MIT](https://github.com/react-navigation/react-navigation/blob/main/packages/native/LICENSE)

[@react-navigation/native](https://github.com/react-navigation/native): MIT License

[@react-navigation/native-stack](https://github.com/react-navigation/react-navigation): [MIT](https://github.com/react-navigation/react-navigation/blob/main/packages/native/LICENSE)

[@shopify/flash-list](https://github.com/Shopify/flash-list): MIT License

[axios](https://github.com/axios/axios): MIT License

[babel-plugin-transform-remove-console](https://github.com/Riokai/babel-plugin-transform-remove-console): Unknown

[bottleneck](https://github.com/pydata/bottleneck): BSD 2-Clause "Simplified" License

[deepmerge](https://github.com/TehShrike/deepmerge): MIT License

[dropbox](https://github.com/BenExile/Dropbox): MIT License

[fflate](https://github.com/101arrowz/fflate): MIT License

[i18next](https://github.com/i18next/i18next): MIT License

[md5](https://github.com/JieweiWei/md5): Apache License 2.0

[react](https://github.com/facebook/react): MIT License

[react-i18next](https://github.com/i18next/react-i18next): MIT License

[react-native](https://github.com/facebook/react-native): MIT License

[react-native-app-auth](https://github.com/FormidableLabs/react-native-app-auth): MIT License

[react-native-background-timer](https://github.com/ocetnik/react-native-background-timer): MIT License

[react-native-blob-jsi-helper](https://github.com/mrousavy/react-native-blob-jsi-helper): MIT License

[react-native-countdown-circle-timer](https://github.com/vydimitrov/react-countdown-circle-timer): MIT

[react-native-draggable-flatlist](https://github.com/computerjazz/react-native-draggable-flatlist): MIT License

[react-native-fast-image](https://github.com/DylanVann/react-native-fast-image): MIT License

[react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler): MIT License

[react-native-lyric](https://github.com/SKempin/Lyrics-King-React-Native): MIT License

[react-native-pager-view](https://github.com/callstack/react-native-pager-view): MIT License

[react-native-paper](https://github.com/callstack/react-native-paper): MIT License

[react-native-qrcode-svg](https://github.com/awesomejerry/react-native-qrcode-svg): MIT License

[react-native-reanimated](https://github.com/software-mansion/react-native-reanimated): MIT License

[react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context): MIT License

[react-native-screens](https://github.com/software-mansion/react-native-screens): MIT License

[react-native-snackbar](https://github.com/cooperka/react-native-snackbar): MIT

[react-native-svg](https://github.com/software-mansion/react-native-svg): MIT License

[react-native-tab-view](https://github.com/ptomasroos/react-native-scrollable-tab-view): Unknown

[react-native-track-player](https://github.com/doublesymmetry/react-native-track-player): Apache License 2.0

[react-native-url-polyfill](https://github.com/charpeni/react-native-url-polyfill): MIT License

[react-native-vector-icons](https://github.com/oblador/react-native-vector-icons): MIT License

[react-native-video](https://github.com/react-native-video/react-native-video): MIT License

[react-native-windows](https://github.com/microsoft/react-native-windows): MIT

[react-use](https://github.com/streamich/react-use): The Unlicense

[use-debounce](https://github.com/xnimorz/use-debounce): MIT License

[zustand](https://github.com/pmndrs/zustand): MIT License
