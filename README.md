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
<h3 align="center" style="color:purple">Azusa-Player / 电梓播放器</h3>
<h4 align="center" style="color:purple">A 3rd party Bilibili audio player / 一个Bilibili第三方音频播放器</h4>

## 项目简介

- 是真正意义上的《电梓播放器》(?): Azusa-Player！
  - 私货默认歌单 [【阿梓】2021 精选翻唱 50 首【纯享】](https://www.bilibili.com/video/BV1wr4y1v7TA)
- 本质上是个 b 站第三方**音频在线播放器**，以浏览器扩展插件形式展现
- 目的是想让视频**轻量化**为音频，方便溜歌/歌单分类/下载等
- 支持单 P/多 P 视频搜索(视情况适配新的合集功能)
  - <del> QA 阶段才发现 b 站把分 P 砍了; ; </del>
- 实现了歌名提取与歌词搜索
  - 歌名提取不准确的话需要手动输歌名
- **切片 man 不易，没有各位切片 man 也不会有这个项目的意义，请大家溜歌同时多点进视频给他们个赞 👍**
- 自用为主要目的，不感兴趣的 feature 大概不会做，有问题可以[b 站私信](https://message.bilibili.com/#/whisper/mid1989881)
  - 但是欢迎提 PR! <del>(虽然代码很烂)</del>
 
## Development

```
git clone https://github.com/lovegaoshi/azusa-player-mobile.git
yarn build
yarn
cd ios && pod install && cd ..
```
