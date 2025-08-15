import { NoxRepeatMode } from '../enums/RepeatMode';
import { Versions } from '../enums/Version';
import { SyncOptions } from '../enums/Sync';
// eslint-disable-next-line import/no-unresolved
import { MAESTRO } from '@env';

export const AppID = 'NoxPlayerMobile';

const _DefaultSetting: NoxStorage.PlayerSettingDict = {
  playMode: 'shufflePlay',
  defaultPlayMode: 'shufflePlay',
  defaultVolume: 1,

  autoRSSUpdate: true,
  skin: '诺莺Nox',
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
  noCookieBiliSearch: true,
  playbackMode: NoxRepeatMode.Shuffle,
  dataSaver: false,
  fastBiliSearch: true,
  noInterruption: false,
  updateLoadedTrack: false,
  r128gain: false,
  prefetchTrack: false,
  chatGPTResolveSongName: false,
  trackCoverArtCard: true,
  suggestedSkipLongVideo: true,
  wavyProgressBar: false,
  screenAlwaysWake: false,
  biliEditAPI: false,
  keepForeground: false,
  karaokeLyrics: true,
  accentColor: false,
  memoryEfficiency: true,
  useSuggestion: false,
  noRepeat: false,
  audioOffload: true,
  parseEmbeddedArtwork: false,
  skipSilence: false,
  crossfade: 0,
  preferYTMSuggest: true,
  artworkRes: 0,
  artworkCarousel: false,
  pausePlaybackOnMute: false,
  noBiliR128Gain: false,
  smartShuffle: true,
  lyricTap: true,
  fontScale: 1,
  lyricFontScale: 0,
  spotifyLyricStyle: false,

  appID: AppID,
  language: undefined,
  cacheSize: 1,

  downloadLocation: undefined,
  downloadToMp3: true,
  downloadID3V2: true,
  downloadEmbedAlbumCover: true,
  alwaysShowBottomTab: false,
  nativeBottomTab: true,
  noxSkipSilence: false,

  sponsorBlockCat: [],
  sponsorBlockEnabled: false,

  eqPreset: 0,
  loudnessEnhance: 0,

  beatMatchCrossfade: false,
  beatMatchCrossfadeIn: 10,
  beatMatchCrossfadeOut: 10,
};

export const DefaultSetting = MAESTRO
  ? { ..._DefaultSetting, alwaysShowBottomTab: true }
  : _DefaultSetting;

export const OverrideSetting: Partial<NoxStorage.PlayerSettingDict> = {};
