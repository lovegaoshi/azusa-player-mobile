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

declare namespace NoxEnumMediaFetch {
  export enum Source {
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

declare namespace NoxEnumRNTP {
  export enum NoxRepeatMode {
    SHUFFLE = 'shuffle',
    REPEAT = 'repeat',
    REPEAT_TRACK = 'repeat-once',
    SUGGEST = 'dice-multiple',
  }
}
