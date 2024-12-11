import { StateCreator } from 'zustand';

import { createStyle } from '@components/style';
import { savePlayerStyle } from '@utils/StyleStorage';
import { savePlayerSkins } from '@utils/ChromeStorage';

export interface UIStore {
  playerStyle: any;
  setPlayerStyle: (style: any, save?: boolean) => void;
  playerStyles: any[];
  setPlayerStyles: (val: any[]) => void;

  searchBarProgress: number;
  searchBarProgressEmitter: (val: number) => undefined;
  // HACK: i'm out of my wits but heres what i got to force rerender playlist...
  playlistShouldReRender: boolean;
  togglePlaylistShouldReRender: () => void;
}

const store: StateCreator<UIStore, [], [], UIStore> = set => ({
  playerStyle: createStyle(),
  setPlayerStyle: (val, save = true) =>
    set({ playerStyle: savePlayerStyle(val, save) }),
  playerStyles: [],
  setPlayerStyles: val => {
    set({ playerStyles: val });
    savePlayerSkins(val);
  },

  searchBarProgress: 0,
  searchBarProgressEmitter: val => {
    set({ searchBarProgress: val / 100 });
    return undefined;
  },
  playlistShouldReRender: false,
  togglePlaylistShouldReRender: () =>
    set(state => ({ playlistShouldReRender: !state.playlistShouldReRender })),
});

export default store;
