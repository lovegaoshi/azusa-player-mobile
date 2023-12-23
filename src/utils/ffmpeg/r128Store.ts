// vanilla store of zustand serving playbackServices.
import { createStore } from 'zustand/vanilla';

import { getR128GainMapping, saveR128GainMapping } from '@utils/ChromeStorage';

interface AppStore {
  r128gain: NoxStorage.R128Dict;
  setR128gain: (val: NoxStorage.R128Dict) => void;
}

const appStore = createStore<AppStore>(set => ({
  pipMode: false,
  r128gain: {},
  setR128gain: (val: NoxStorage.R128Dict) => {
    set({ r128gain: val });
    saveR128GainMapping(val);
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

export const getR128Gain = (song: NoxMedia.Song) => {
  const { r128gain } = appStore.getState();
  return r128gain[song.id] ?? 0;
};

export const addR128Gain = (song: NoxMedia.Song, gain: number | null) => {
  saveR128Gain({ [song.id]: gain });
};

export default appStore;
