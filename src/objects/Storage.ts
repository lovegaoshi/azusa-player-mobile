import { NoxRepeatMode } from '../enums/RepeatMode';
import { Versions } from '../enums/Version';
import { SyncOptions } from '../enums/Sync';

export const AppID = 'NoxPlayerMobile';

export const DefaultSetting: NoxStorage.PlayerSettingDict = {
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

  appID: AppID,
  language: undefined,
  cacheSize: 1,

  downloadLocation: undefined,
  downloadToMp3: true,
  downloadID3V2: true,
  downloadEmbedAlbumCover: true,

  sponsorBlockCat: [],
  sponsorBlockEnabled: false,
};

export const OverrideSetting: Partial<NoxStorage.PlayerSettingDict> = {};
