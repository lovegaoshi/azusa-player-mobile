// vanilla store of zustand serving playbackServices.
import { createStore } from 'zustand/vanilla';

import {
  loadR128GainMapping,
  saveR128GainMapping,
  loadABMapping,
  saveABMapping,
} from '@utils/ChromeStorage';
import type { NoxStorage } from '../types/storage';

interface AppStore {
  pipMode: boolean;
  r128gain: NoxStorage.R128Dict;
  setR128gain: (val: NoxStorage.R128Dict) => void;
  ABRepeat: NoxStorage.ABDict;
  setABRepeat: (val: NoxStorage.ABDict) => void;
  currentPlayingId: String;
  setCurrentPlayingId: (val: String) => void;
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
  currentPlayingId: '',
  setCurrentPlayingId: (val: String) => {
    set({ currentPlayingId: val });
  },
}));

export const initialize = async () => {
  appStore.setState({ r128gain: await loadR128GainMapping() });
  appStore.setState({ ABRepeat: await loadABMapping() });
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

export const addR128Gain = (song: NoxMedia.Song, gain: string | null) => {
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

export default appStore;
// const { getState, setState } =
