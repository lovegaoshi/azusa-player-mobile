// vanilla store of zustand serving playbackServices.
import { createStore } from 'zustand/vanilla';
import { UpdateOptions } from 'react-native-track-player';

import {
  getABMapping,
  saveABMapping,
  getFadeInterval,
  getRegExtractMapping,
} from '@utils/ChromeStorage';
import rejson from '@utils/rejson.json';
import { logger } from '@utils/Logger';
import { LoadJSONRegExtractors } from '../utils/re';
import type { NoxStorage } from '../types/storage';

interface AppStore {
  pipMode: boolean;
  ABRepeat: NoxStorage.ABDict;
  setABRepeat: (val: NoxStorage.ABDict) => void;
  // used for Event.PlaybackActiveTrackChanged.
  // this is set immediately at Event.PlaybackActiveTrackChanged.
  activeTrackPlayingId: string;
  setActiveTrackPlayingId: (val: string) => void;
  // used for ABRepeat so that ABRepeat will only seek to A once
  // when playstate becomes ready.
  currentPlayingId: string;
  setCurrentPlayingId: (val: string) => void;
  fetchProgress: number;
  setFetchProgress: (val: number) => void;
  downloadProgressMap: NoxStorage.R128Dict;
  setDownloadProgressMap: (val: NoxStorage.R128Dict) => void;
  downloadPromiseMap: NoxStorage.DownloadDict;
  setDownloadPromiseMap: (val: NoxStorage.DownloadDict) => void;
  fadeIntervalMs: number;
  fadeIntervalSec: number;
  RNTPOptions?: UpdateOptions;
  setRNTPOptions: (val: UpdateOptions) => void;
  reExtractSongName: (name: string, uploader: string | number) => string;
  cachedResolveURLMap: {
    [key: string]: NoxNetwork.ResolvedNoxMediaURL | undefined;
  };
  animatedVolumeChangedCallback: () => void;
}

const appStore = createStore<AppStore>(set => ({
  pipMode: false,
  ABRepeat: {},
  setABRepeat: (val: NoxStorage.ABDict) => {
    set({ ABRepeat: val });
    saveABMapping(val);
  },
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
  fadeIntervalMs: 500,
  fadeIntervalSec: 0.5,
  setRNTPOptions: (val: UpdateOptions) => {
    set({ RNTPOptions: val });
  },
  reExtractSongName: (val: string) => val,
  cachedResolveURLMap: {},
  animatedVolumeChangedCallback: () => undefined,
}));

export const initialize = async () => {
  const fadeInterval = await getFadeInterval();
  const savedRegExt = await getRegExtractMapping();
  appStore.setState({
    ABRepeat: await getABMapping(),
    fadeIntervalMs: fadeInterval,
    fadeIntervalSec: fadeInterval / 1000,
    reExtractSongName: LoadJSONRegExtractors(
      savedRegExt.length > 0
        ? savedRegExt
        : (rejson as NoxRegExt.JSONExtractor[])
    ),
  });
};

export const reExtractSongName = (name: string, uploader: string | number) =>
  appStore.getState().reExtractSongName(name, uploader);

export const parseSongName = (song: NoxMedia.Song): NoxMedia.Song => {
  return {
    ...song,
    parsedName: reExtractSongName(song.name, song.singerId),
  };
};

export const saveABRepeat = async (val: NoxStorage.ABDict) => {
  const newR128gain = { ...appStore.getState().ABRepeat, ...val };
  appStore.setState({ ABRepeat: newR128gain });
  saveABMapping(newR128gain);
};

export const getABRepeatRaw = (songId: string) => {
  const { ABRepeat } = appStore.getState();
  return ABRepeat[songId] ?? [0, 1];
};

export const getABRepeat = (song: NoxMedia.Song) => {
  return getABRepeatRaw(song.id);
};

export const addABRepeat = (
  song: NoxMedia.Song,
  abrepeat: [number, number]
) => {
  saveABRepeat({ [song.id]: abrepeat });
};

export const setCurrentPlaying = (song: NoxMedia.Song) => {
  const currentPlayingId = appStore.getState().currentPlayingId;
  if (currentPlayingId === song.id) {
    return true;
  }
  appStore.setState({ currentPlayingId: song.id });
  // HACK: skips ABRepeat of the first song set by app (which should be handled by resumePlayback)
  return currentPlayingId === '';
};

export const setFetchProgress = (val: number) => {
  appStore.setState({ fetchProgress: val });
};

export const addDownloadProgress = async (
  song: NoxMedia.Song,
  progress: number
) => {
  const currentAppStore = appStore.getState();
  const newDownloadProgressMap = {
    ...currentAppStore.downloadProgressMap,
    [song.id]: progress,
  };
  appStore.setState({
    downloadProgressMap: newDownloadProgressMap,
    ...(currentAppStore.activeTrackPlayingId === song.id && {
      fetchProgress: progress,
    }),
  });
};

export const addDownloadPromise = async (
  song: NoxMedia.Song,
  downloadPromise: Promise<string | void>
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
  resolveURL: (song: NoxMedia.Song) => Promise<NoxNetwork.ResolvedNoxMediaURL>
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

export const resetResolvedURL = (song?: NoxMedia.Song) => {
  if (song) {
    const cachedResolveURLMap = appStore.getState().cachedResolveURLMap;
    appStore.setState({
      cachedResolveURLMap: { ...cachedResolveURLMap, [song.id]: undefined },
    });
  } else {
    appStore.setState({
      cachedResolveURLMap: {},
    });
  }
};

export default appStore;
