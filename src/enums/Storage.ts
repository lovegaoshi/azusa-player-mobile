import { NoxRepeatMode } from './RepeatMode';
import { VERSIONS } from './Version';
import { EXPORT_OPTIONS } from './Sync';
import type { NoxStorage } from '../types/storage';

export enum STORAGE_KEYS {
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
  LYRIC_MAPPING = 'LyricMapping',
  LAST_PLAY_DURATION = 'LastPlayDuration',
  CACHED_MEDIA_MAPPING = 'CachedMediaMapping',
  DEFAULT_SEARCH = 'defaultSearch',
  R128GAIN_MAPPING = 'R128GainMapping',
  ABREPEAT_MAPPING = 'ABREPEATMapping',
  FADE_INTERVAL = 'fadeInterval',
  COLORTHEME = 'ColorTheme',
  REGEXTRACT_MAPPING = 'RegexExtract',
}

export enum SEARCH_OPTIONS {
  BILIBILI = 'bilibili',
  YOUTUBE = 'youtube',
}

export const appID = 'NoxPlayerMobile';

export const DEFAULT_SETTING: NoxStorage.PlayerSettingDict = {
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
  playerRepeat: NoxRepeatMode.SHUFFLE,
  dataSaver: false,
  fastBiliSearch: true,
  noInterruption: false,
  updateLoadedTrack: false,
  r128gain: false,
  prefetchTrack: false,
  chatGPTResolveSongName: false,
  trackCoverArtCard: false,

  appID,
  language: undefined,
  cacheSize: 1,
};
