// vanilla store of zustand serving playbackServices.
import { createStore } from 'zustand/vanilla';

import { DEFAULT_SETTING } from '@enums/Storage';
import { saveSettings, getSettings } from '@utils/ChromeStorage';

interface AppStore {
  playerSetting: NoxStorage.PlayerSettingDict;
  setPlayerSetting: (val: Partial<NoxStorage.PlayerSettingDict>) => void;
}

const playerSettingStore = createStore<AppStore>((set, get) => ({
  playerSetting: DEFAULT_SETTING,
  setPlayerSetting: (val: Partial<NoxStorage.PlayerSettingDict>) => {
    const newPlayerSetting = { ...get().playerSetting, ...val };
    set({ playerSetting: newPlayerSetting });
    saveSettings(newPlayerSetting);
  },
}));

export const initializePlayerSetting = async () => {
  playerSettingStore.setState({
    playerSetting: await getSettings(),
  });
};

export const setPlayerSetting = (
  newSetting: Partial<NoxStorage.PlayerSettingDict>
) => {
  const currentSetting = playerSettingStore.getState();
  playerSettingStore.setState({
    playerSetting: { ...currentSetting.playerSetting, ...newSetting },
  });
};

export default playerSettingStore;
// const { getState, setState } =
