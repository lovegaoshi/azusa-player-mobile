// vanilla store of zustand serving playbackServices.
import { createStore } from 'zustand/vanilla';

import { getR128GainMapping, saveR128GainMapping } from '@utils/ChromeStorage';

interface AppStore {
  pipMode: boolean;
  r128gain: NoxStorage.R128Dict;
  setR128gain: (val: NoxStorage.R128Dict) => void;
  // used for ABRepeat so that ABRepeat will only seek to A once
  // when playstate becomes ready.
  currentPlayingId: string;
  setCurrentPlayingId: (val: string) => void;
}

const appStore = createStore<AppStore>(set => ({
  pipMode: false,
  r128gain: {},
  setR128gain: (val: NoxStorage.R128Dict) => {
    set({ r128gain: val });
    saveR128GainMapping(val);
  },
  currentPlayingId: '',
  setCurrentPlayingId: (val: string) => {
    set({ currentPlayingId: val });
  },
}));

export const initializeR128Gain = async () => {
  appStore.setState({
    r128gain: await getR128GainMapping(),
  });
};

const saveR128Gain = async (val: NoxStorage.R128Dict) => {
  const newR128gain = { ...appStore.getState().r128gain, ...val };
  appStore.setState({ r128gain: newR128gain });
  saveR128GainMapping(newR128gain);
};

export const getR128Gain = (song?: NoxMedia.Song) => {
  const { r128gain, currentPlayingId } = appStore.getState();
  return r128gain[song ? song.id : currentPlayingId] ?? null;
};

export const addR128Gain = (song: NoxMedia.Song, gain: number | null) => {
  saveR128Gain({ [song.id]: gain });
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
