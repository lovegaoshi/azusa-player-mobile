import { NoxRepeatMode } from '../enums/RepeatMode';
import { Versions } from '../enums/Version';
import { SyncOptions } from '../enums/Sync';

export const AppID = 'NoxPlayerMobile';

export const DefaultSetting: NoxStorage.PlayerSettingDict = {
  playMode: 'shufflePlay',
  defaultPlayMode: 'shufflePlay',
  defaultVolume: 1,

  autoRSSUpdate: true,
  skin: '诺莺nox',
  parseSongName: true,
  keepSearchedSongListWhenPlaying: false,
  settingExportLocation: SyncOptions.DROPBOX,
  personalCloudIP: '',
  personalCloudID: 'azusamobile',
  noxVersion: Versions.Latest,
  noxCheckedVersion: Versions.Latest,

  hideCoverInMobile: false,
  loadPlaylistAsArtist: false,
  sendBiliHeartbeat: false,
  noCookieBiliSearch: false,
  playbackMode: NoxRepeatMode.Shuffle,
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
  karaokeLyrics: false,
  accentColor: false,
  memoryEfficiency: false,
  useSuggestion: false,
  enableBili: false,
  noRepeat: false,
  audioOffload: true,
  parseEmbeddedArtwork: false,
  skipSilence: false,
  crossfade: 0,
  preferYTMSuggest: true,
  artworkRes: 0,
  artworkCarousel: false,

  appID: AppID,
  language: undefined,
  cacheSize: 1,

  downloadLocation: undefined,
  downloadToMp3: true,
  downloadID3V2: true,
  downloadEmbedAlbumCover: true,
};

export const OverrideSetting: Partial<NoxStorage.PlayerSettingDict> = {};
