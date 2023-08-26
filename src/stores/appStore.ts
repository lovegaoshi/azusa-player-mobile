// vanilla store of zustand serving playbackServices.
import { createStore } from 'zustand/vanilla';
import { UpdateOptions } from 'react-native-track-player';

import {
  getR128GainMapping,
  saveR128GainMapping,
  getABMapping,
  saveABMapping,
  getFadeInterval,
} from '@utils/ChromeStorage';
import type { NoxStorage } from '../types/storage';

interface AppStore {
  pipMode: boolean;
  r128gain: NoxStorage.R128Dict;
  setR128gain: (val: NoxStorage.R128Dict) => void;
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
}

const appStore = createStore<AppStore>((set, get) => ({
  pipMode: false,
  r128gain: {},
  setR128gain: (val: NoxStorage.R128Dict) => {
    set({ r128gain: val });
    saveR128GainMapping(val);
  },
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
}));

export const initialize = async (val: NoxStorage.PlayerStorageObject) => {
  const fadeInterval = await getFadeInterval();
  appStore.setState({
    r128gain: await getR128GainMapping(),
    ABRepeat: await getABMapping(),
    fadeIntervalMs: fadeInterval,
    fadeIntervalSec: fadeInterval / 1000,
  });
};

export const saveR128Gain = async (val: NoxStorage.R128Dict) => {
  const newR128gain = { ...appStore.getState().r128gain, ...val };
  appStore.setState({ r128gain: newR128gain });
  saveR128GainMapping(newR128gain);
};

export const getR128Gain = (song: NoxMedia.Song) => {
  const { r128gain } = appStore.getState();
  return r128gain[song.id] ?? null;
};

export const addR128Gain = (song: NoxMedia.Song, gain: number | null) => {
  saveR128Gain({ [song.id]: gain });
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
};

export default appStore;
