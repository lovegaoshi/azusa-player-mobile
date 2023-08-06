// vanilla store of zustand serving playbackServices.
import { createStore } from 'zustand/vanilla';

interface AppStore {
  pipMode: boolean;
}

const appStore = createStore<AppStore>(() => ({
  pipMode: false,
}));

export default appStore;
// const { getState, setState } =
