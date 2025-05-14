// vanilla store of zustand serving playbackServices.
import { createStore } from 'zustand/vanilla';
// @ts-ignore HACK: for noxplayer's compatibility
import { UpdateOptions } from 'react-native-track-player';

import { getFadeInterval } from '@utils/ChromeStorage';
import { logger } from '@utils/Logger';
import noxCache from '@utils/Cache';

interface AppStore {
  crossfaded: boolean;
  pipMode: boolean;
  // used for Event.PlaybackActiveTrackChanged.
  // this is set immediately at Event.PlaybackActiveTrackChanged.
  activeTrackPlayingId: string;
  setActiveTrackPlayingId: (val: string) => void;
  // used for ABRepeat so that ABRepeat will only seek to A once
  // when playstate becomes ready.
  currentPlayingId: string;
  setCurrentPlayingId: (val: string) => void;
  fetchProgress: number;
  setFetchProgress: NoxUtils.ProgressEmitter;
  downloadProgressMap: NoxStorage.R128Dict;
  setDownloadProgressMap: (val: NoxStorage.R128Dict) => void;
  downloadPromiseMap: NoxStorage.DownloadDict;
  setDownloadPromiseMap: (val: NoxStorage.DownloadDict) => void;
  downloadQueue: NoxStorage.DownloadPromise[];
  fadeIntervalMs: number;
  fadeIntervalSec: number;
  RNTPOptions?: UpdateOptions;
  setRNTPOptions: (val: UpdateOptions) => void;
  cachedResolveURLMap: {
    [key: string]: NoxNetwork.ResolvedNoxMediaURL | undefined;
  };
  animatedVolumeChangedCallback: () => void;
}

const appStore = createStore<AppStore>(set => ({
  crossfaded: false,
  downloadQueue: [],
  pipMode: false,
  activeTrackPlayingId: '',
  setActiveTrackPlayingId: (val: string) => {
    set({ activeTrackPlayingId: val });
  },
  currentPlayingId: '',
  setCurrentPlayingId: (val: string) => {
    set({ currentPlayingId: val });
  },
  fetchProgress: 100,
  setFetchProgress: (val: number) => {
    set({ fetchProgress: val });
  },
  downloadProgressMap: {},
  setDownloadProgressMap: (val: NoxStorage.R128Dict) => {
    set({ downloadProgressMap: val });
  },
  downloadPromiseMap: {},
  setDownloadPromiseMap: (val: NoxStorage.DownloadDict) => {
    set({ downloadPromiseMap: val });
  },
  fadeIntervalMs: 0,
  fadeIntervalSec: 0,
  setRNTPOptions: (val: UpdateOptions) => {
    set({ RNTPOptions: val });
  },
  reExtractSongName: (val: string) => val,
  cachedResolveURLMap: {},
  animatedVolumeChangedCallback: () => undefined,
}));

export const initialize = async () => {
  const fadeInterval = await getFadeInterval();
  appStore.setState({
    fadeIntervalMs: fadeInterval,
    fadeIntervalSec: fadeInterval / 1000,
  });
};

export const setCrossfaded = (crossfaded = true) => {
  appStore.setState({ crossfaded });
};

export const setCurrentPlaying = (song: NoxMedia.Song) => {
  const currentPlayingId = appStore.getState().currentPlayingId;
  if (currentPlayingId === song.id) {
    return true;
  }
  appStore.setState({ currentPlayingId: song.id });
  return false;
};

export const setFetchProgress = (val: number) => {
  appStore.setState({ fetchProgress: val });
};

export const addDownloadProgress = (song: NoxMedia.Song, progress: number) => {
  const { downloadProgressMap, activeTrackPlayingId } = appStore.getState();
  const newDownloadProgressMap = {
    ...downloadProgressMap,
    [song.id]: progress,
  };
  appStore.setState({
    downloadProgressMap: newDownloadProgressMap,
    ...(activeTrackPlayingId === song.id && {
      fetchProgress: progress,
    }),
  });
};

export const addDownloadPromise = (
  song: NoxMedia.Song,
  downloadPromise: Promise<string | void>,
) => {
  const newMap = {
    ...appStore.getState().downloadPromiseMap,
    [song.id]: downloadPromise,
  };
  appStore.setState({ downloadPromiseMap: newMap });
  return downloadPromise;
};

export const cacheResolvedURL = async (
  song: NoxMedia.Song,
  resolveURL: (song: NoxMedia.Song) => Promise<NoxNetwork.ResolvedNoxMediaURL>,
) => {
  const cachedResolveURLMap = appStore.getState().cachedResolveURLMap;
  const cachedResolvedURL = cachedResolveURLMap[song.id];
  if (
    cachedResolvedURL === undefined ||
    new Date().getTime() - cachedResolvedURL.urlRefreshTimeStamp > 1200000
  ) {
    logger.debug(`[CacheResolveURL] ${song.parsedName} needs to be refetched.`);
    const result = await resolveURL(song);
    appStore.setState({
      cachedResolveURLMap: { ...cachedResolveURLMap, [song.id]: result },
    });
    return result;
  }
  return cachedResolvedURL;
};

export const resetResolvedURL = (song?: NoxMedia.Song, deleteCache = false) => {
  if (song) {
    deleteCache && noxCache.noxMediaCache.deleteSongCache(song);
    const cachedResolveURLMap = appStore.getState().cachedResolveURLMap;
    appStore.setState({
      cachedResolveURLMap: { ...cachedResolveURLMap, [song.id]: undefined },
    });
  } else {
    appStore.setState({ cachedResolveURLMap: {} });
  }
};

export default appStore;
