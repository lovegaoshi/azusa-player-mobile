import { VERSIONS } from './Version';

declare global {
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

    declare namespace Sync {
      export enum ExportOptions {
        LOCAL = '本地',
        DROPBOX = 'Dropbox',
        PERSONAL = '私有云',
        GITEE = 'Gitee',
      }
    }

    declare namespace Storage {
      export enum StorageKeys {
        PLAYER_SETTING_KEY = 'PlayerSetting',
        FAVORITE_PLAYLIST_KEY = 'FavFavList-Special',
        SEARCH_PLAYLIST_KEY = 'SearchPlaylist-Special',
        LAST_PLAY_LIST = 'LastPlayList',
        FAVLIST_AUTO_UPDATE_TIMESTAMP = 'favListAutoUpdateTimestamp',
        MY_FAV_LIST_KEY = 'MyFavList',
        PLAYMODE_KEY = 'Playmode',
        SKIN = 'PlayerSkin',
        SKINSTORAGE = 'PlayerSkinStorage',
        COOKIES = 'Cookies',
        LYRIC_MAPPING = 'NewLyricMapping',
        LAST_PLAY_DURATION = 'LastPlayDuration',
        CACHED_MEDIA_MAPPING = 'CachedMediaMapping',
        DEFAULT_SEARCH = 'defaultSearch',
        R128GAIN_MAPPING = 'R128GainMapping',
        ABREPEAT_MAPPING = 'ABREPEATMapping',
        FADE_INTERVAL = 'fadeInterval',
        COLORTHEME = 'ColorTheme',
        REGEXTRACT_MAPPING = 'RegexExtract',
        MUSICFREE_PLUGIN = 'MusicFreePlugin',
      }

      export enum SearchOptions {
        BILIBILI = 'bilibili',
        YOUTUBE = 'youtube',
      }

      export const AppID = 'NoxPlayerMobile';

      export const DefaultSetting: NoxStorage.PlayerSettingDict = {
        playMode: 'shufflePlay',
        defaultPlayMode: 'shufflePlay',
        defaultVolume: 1,

        autoRSSUpdate: true,
        skin: '诺莺nox',
        parseSongName: true,
        keepSearchedSongListWhenPlaying: false,
        settingExportLocation: EXPORT_OPTIONS.DROPBOX,
        personalCloudIP: '',
        personalCloudID: 'azusamobile',
        noxVersion: VERSIONS.latest,
        noxCheckedVersion: VERSIONS.latest,

        hideCoverInMobile: false,
        loadPlaylistAsArtist: false,
        sendBiliHeartbeat: false,
        noCookieBiliSearch: false,
        playbackMode: NoxEnum.RNTP.NoxRepeatMode.SHUFFLE,
        dataSaver: false,
        fastBiliSearch: true,
        noInterruption: false,
        updateLoadedTrack: false,
        r128gain: false,
        prefetchTrack: false,
        chatGPTResolveSongName: false,
        trackCoverArtCard: false,
        suggestedSkipLongVideo: true,
        wavyProgressBar: false,
        screenAlwaysWake: false,
        biliEditAPI: false,
        keepForeground: false,

        appID,
        language: undefined,
        cacheSize: 1,
      };
    }

    declare namespace Playlist {
      export enum PlaylistEnums {
        TYPE_TYPICA_PLAYLIST = 'typical',
        TYPE_SEARCH_PLAYLIST = 'search',
        TYPE_FAVORI_PLAYLIST = 'favorite',
      }

      export const SearchRegex: {
        [key: string]: { regex: RegExp; text: string };
      } = {
        absoluteMatch: { regex: /Parsed:(.+)/, text: 'Parsed:' },
        artistMatch: { regex: /Artist:(.+)/, text: 'Artist:' },
        albumMatch: { regex: /Album:(.+)/, text: 'Album:' },
        cachedMatch: { regex: /Cached:/, text: 'Cached:' },
      };

      export enum SortOptions {
        TITLE = 'title',
        ARTIST = 'artist',
        ALBUM = 'album',
        DATE = 'date',
        PREVIOUS_ORDER = 'previous',
      }
    }
  }
}
