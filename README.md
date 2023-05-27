# Azusa-player-mobile

[![android weekly](https://github.com/lovegaoshi/azusa-player-mobile/actions/workflows/android-weekly.yml/badge.svg?branch=master)](https://github.com/lovegaoshi/azusa-player-mobile/actions/workflows/android-weekly.yml)

<p align="center"><a href="https://github.com/kenmingwang/azusa-player"><img width="200" src="https://github.com/kenmingwang/azusa-player/blob/master/public/img/logo2-01.png?raw=true"></a></p>

<p align="center">
  <a href="https://github.com/kenmingwang/azusa-player/blob/master/LICENSE">
    <img src="https://camo.githubusercontent.com/992daabc2aa4463339825f8333233ba330dd08c57068f6faf4bb598ab5a3df2e/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f6c6963656e73652d4d49542d627269676874677265656e2e737667" alt="Software License" data-canonical-src="https://img.shields.io/badge/license-MIT-brightgreen.svg" style="max-width: 100%;">
  </a>
  <a href="">
    <img alt="GitHub release (latest by date)" src="https://img.shields.io/github/stars/kenmingwang/azusa-player">
  </a>
  <a href="https://github.com/kenmingwang/azusa-player/releases">
    <img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/kenmingwang/azusa-player">
  </a>
  <a href="https://github.com/kenmingwang/azusa-player/actions/workflows/webpack.yml">
    <img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/kenmingwang/azusa-player/webpack.yml">
  </a>
  </br>
  <a href="https://chrome.google.com/webstore/detail/%E7%94%B5%E6%A2%93%E6%92%AD%E6%94%BE%E5%99%A8-%E7%AC%AC%E4%B8%89%E6%96%B9bilibili%E9%9F%B3%E9%A2%91%E6%92%AD%E6%94%BE%E5%99%A8/bdplgemfnbaefommicdebhboajognnhj">
    <img alt="GitHub Workflow Status" src="https://img.shields.io/chrome-web-store/users/bdplgemfnbaefommicdebhboajognnhj?color=blue&label=chrome-user">
  </a>
  <a href="https://microsoftedge.microsoft.com/addons/detail/%E7%94%B5%E6%A2%93%E6%92%AD%E6%94%BE%E5%99%A8%E7%AC%AC%E4%B8%89%E6%96%B9bilibili%E9%9F%B3%E9%A2%91%E6%92%AD%E6%94%BE%E5%99%A8/bikfgaolchpolficinadmbmkkohkbkdf">
    <img alt="GitHub all releases" src="https://img.shields.io/badge/dynamic/json?label=edge-user&query=%24.activeInstallCount&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fbikfgaolchpolficinadmbmkkohkbkdf">
  </a>
  <a href="https://github.com/kenmingwang/azusa-player/releases">
    <img alt="GitHub all releases" src="https://img.shields.io/github/downloads/kenmingwang/azusa-player/total">
  </a>
</p>
<h3 align="center" style="color:purple">Azusa-Player-Mobile / 电梓播放器手机版</h3>
<h4 align="center" style="color:purple">A 3rd party Bilibili audio player / 一个Bilibili第三方音频播放器</h4>

## 项目简介

- 是真正意义上的手机版《电梓播放器》(?): Azusa-Player！
- 本质上是个 b 站第三方**音频在线播放器**，是插件版[电梓播放器](https://github.com/kenmingwang/azusa-player) 和[电闹播放器](https://github.com/lovegaoshi/azusa-player)的忠实移植；对标油管音乐，但是去除歌单推荐功能~2023年不会还有人用b站推荐听歌吧~，交互仿造AIMP，界面更简洁，设计更人性。
  - 由于浏览器地八哥轻松简便并且我手机流量捉急，主要功能依然会在插件版[电闹播放器](https://github.com/lovegaoshi/azusa-player)优先更新
- 目的是想让视频**轻量化**为音频，方便溜歌/歌单分类/下载等
- 支持大部分b站视频链接，以及订阅链接实现歌单自动更新；更懂听管人歌切的你
- 实现了歌名提取与歌词搜索
- 支持换皮和自制皮肤
- 支持歌单云备份、与插件版电闹播放器伪互通
- 支持b站登录，点赞，三连，增加b站视频播放量
- 技术栈为跨平台React Native支持安卓和苹果，众筹一台mac和果子商店99USD年费上架ios商店
- **切片 man 不易，没有各位切片 man 也不会有这个项目的意义，请大家溜歌同时点右下方的点赞按钮点赞和三连 👍**
- 自用为主要目的，不感兴趣的 feature 大概不会做，有问题可以[b 站私信](https://message.bilibili.com/#/whisper/mid1989881)
 
## 为什么要使用管人播放器？

市面上有很多播放器竞品，比如整合大量音乐网站，跨平台的[listen1](https://github.com/listen1/listen1_chrome_extension)、[洛雪音乐](https://github.com/lyswhut/lx-music-mobile)、[musicfree](https://github.com/maotoumao/MusicFree)；动画流畅的[MVVM播放器制作教程](https://github.com/KunMinX/Jetpack-MVVM-Best-Practice)；界面简洁好使的本地播放器[AIMP](https://www.aimp.ru/)；支持b站的也不是没有，为什么要用管人播放器？

- 管人播放器之初为了溜阿梓歌切收藏夹而诞生，自从持久、稳定、每日投分p的第五代阿梓切歌人[HonmaMeiko](https://space.bilibili.com/590096/video?tid=0&keyword=&order=pubdate)接棒后，以及[自动切歌软件](https://www.bilibili.com/video/BV1WK411y7zW/?spm_id_from=333.999.0.0)研发成功可以大批量无人值守切各种没人切的管人歌势，管人播放器开发了对b站视频列表的支持，以及订阅b站链接的功能，专注于解决b站视频分p搜索孱弱，整合视频分p、视频列表、视频合集、收藏夹、空间~b站产品经理脑门被夹了搞这么多一样的玩意儿~等多种视频列表为一个统一的歌单。由于b站音乐区本身流量不足~依托答辩~，大多整合类播放器对于b站的支持很基础，并没有管人播放器类别支持广，没有订阅功能，也不整合b站增加播放量、点赞等操作。

- 管人播放器开放用户自制管人皮肤，23年初b站大批量生产装扮，引领虚拟主播约稿提供大量皮肤素材用来自制皮肤。


## 安装

安卓用户在右边的release下载最新版本apk。

## 使用
请参考[电闹播放器的介绍](https://www.bilibili.com/video/BV1bv4y1p7K4/?spm_id_from=333.999.0.0)。

## 开发

ios开发需要XCode。安卓开发需要android studio。
```
git clone https://github.com/lovegaoshi/azusa-player-mobile.git
yarn build
yarn
cd ios && pod install && cd ..
```

IOS编译时请看https://github.com/lovegaoshi/azusa-player-mobile/issues/34。
