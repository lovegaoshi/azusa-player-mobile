import { StateCreator } from 'zustand';

import { IntentData } from '@enums/Intent';
import { SearchOptions } from '@enums/Storage';
import { saveDefaultSearch } from '@utils/ChromeStorage';

export interface APMUIStore {
  appRefresh: boolean;
  setAppRefresh: () => void;

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

  songMenuCoords: NoxTheme.coordinates;
  setSongMenuCoords: (val: NoxTheme.coordinates) => void;
  songMenuVisible: boolean;
  setSongMenuVisible: (val: boolean) => void;
  songMenuSongIndexes: number[];
  setSongMenuSongIndexes: (val: number[]) => void;
  expandCounter: number;
  toggleExpand: () => void;
}

const store: StateCreator<APMUIStore, [], [], APMUIStore> = set => ({
  appRefresh: false,
  setAppRefresh: () => set({ appRefresh: true }),

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

  songMenuCoords: { x: 0, y: 0 },
  setSongMenuCoords: val => set({ songMenuCoords: val }),
  songMenuVisible: false,
  setSongMenuVisible: val => set({ songMenuVisible: val }),
  songMenuSongIndexes: [],
  setSongMenuSongIndexes: val => set({ songMenuSongIndexes: val }),
  expandCounter: 0,
  toggleExpand: () =>
    set(state => ({ expandCounter: state.expandCounter + 1 })),
});

export default store;
