declare namespace NoxEnum {
  declare namespace Icons {
    export enum ScreenIcons {
      HomeScreen = 'home',
      ExploreScreen = 'compass',
      SettingScreen = 'cog',
      PlaylistScreen = 'playlist-music',
    }
  }

  declare namespace Intent {
    export enum IntentData {
      Resume = 'resume',
      PlayAll = 'play_all',
    }
  }

  declare namespace MediaFetch {
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

  declare namespace RNTP {
    export enum NoxRepeatMode {
      SHUFFLE = 'shuffle',
      REPEAT = 'repeat',
      REPEAT_TRACK = 'repeat-once',
      SUGGEST = 'dice-multiple',
    }
  }

  declare namespace View {
    export enum View {
      PLAYER_HOME = 'NoxHome',
      SETTINGS = 'NoxSettings',
      PLAYER_COVER = 'NoxCover',
      PLAYER_PLAYLIST = 'NoxPlaylist',
      PLAYER_PLAYLISTS = 'NoxPlaylists',
      USER_LOGIN = 'NoxLogin',
      EXPORE = 'NoxExplore',
      LYRICS = 'NoxLyrics',
    }
  }

  declare namespace Util {
    export enum RegexType {
      extractWith = 1,
      extractParenthesis = 2,
    }
  }
}
