declare namespace NoxEnumIcons {
  export enum ScreenIcons {
    HomeScreen = 'home',
    ExploreScreen = 'compass',
    SettingScreen = 'cog',
    PlaylistScreen = 'playlist-music',
  }
}

declare namespace NoxEnumIntent {
  export enum IntentData {
    Resume = 'resume',
    PlayAll = 'play_all',
  }
}

declare namespace NoxMediaFetch {
  export enum MediaFetch {
    Biliaudio = 'biliaudio',
    Bilivideo = 'bilivideo',
    Steriatk = 'steriatk',
    Ytbvideo = 'ytbvideo',
    BiliBangumi = 'biliBangumi',
    BiliLive = 'bililive',
    Local = 'local',
  }

  export const BiliMusicTid = [28, 31, 59, 193, 29];
}
