import { StateCreator } from 'zustand';

import { IntentData } from '@enums/Intent';
import { SearchOptions } from '@enums/Storage';
import { saveDefaultSearch } from '@utils/ChromeStorage';

export interface APMUIStore {
  appRefresh: boolean;
  setAppRefresh: () => void;
  // specifically for disabling miniplayer's RNGH on progress sliding
  miniProgressSliding: boolean;
  enableMiniProgressSliding: () => void;
  disableMiniProgressSliding: () => void;

  songListScrollCounter: number;
  incSongListScrollCounter: () => void;

  intentData?: IntentData;
  setIntentData: (val?: IntentData) => void;
  searchOption: SearchOptions;
  setSearchOption: (val: SearchOptions) => void;
  gestureMode: boolean;
  setGestureMode: (val: boolean) => void;

  playlistSearchAutoFocus: boolean;
  setPlaylistSearchAutoFocus: (val: boolean) => void;
  playlistInfoUpdate: boolean;
  togglePlaylistInfoUpdate: () => void;

  songMenuSongIndexes: number[];
  setSongMenuSongIndexes: (val: number[]) => void;

  collapse: () => void;
  expand: () => void;
  expandCounter: number;
  toggleExpand: () => void;
}

const store: StateCreator<APMUIStore, [], [], APMUIStore> = set => ({
  appRefresh: false,
  setAppRefresh: () => set({ appRefresh: true }),

  miniProgressSliding: false,
  enableMiniProgressSliding: () => set({ miniProgressSliding: true }),
  disableMiniProgressSliding: () => set({ miniProgressSliding: false }),

  songListScrollCounter: 0,
  incSongListScrollCounter: () =>
    set(state => ({
      songListScrollCounter: state.songListScrollCounter + 1,
    })),

  setIntentData: intentData => set({ intentData }),

  searchOption: SearchOptions.BILIBILI,
  setSearchOption: v => {
    set({ searchOption: v });
    saveDefaultSearch(v);
  },

  gestureMode: true,
  setGestureMode: val => set({ gestureMode: val }),

  playlistSearchAutoFocus: true,
  setPlaylistSearchAutoFocus: val => set({ playlistSearchAutoFocus: val }),
  playlistInfoUpdate: true,
  togglePlaylistInfoUpdate: () =>
    set(state => ({
      playlistInfoUpdate: !state.playlistInfoUpdate,
    })),

  songMenuSongIndexes: [],
  setSongMenuSongIndexes: val => set({ songMenuSongIndexes: val }),

  collapse: () => void 0,
  expand: () => void 0,
  expandCounter: 0,
  toggleExpand: () =>
    set(state => ({ expandCounter: state.expandCounter + 1 })),
});

export default store;
