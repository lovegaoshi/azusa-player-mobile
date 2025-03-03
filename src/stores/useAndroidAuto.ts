import { StateCreator } from 'zustand';
// HACK: fix i18n!!!
// import i18n from 'i18next';
import TrackPlayer, { AndroidAutoBrowseTree } from 'react-native-track-player';

// zustand store slice template.

export interface AndroidAutoStore {
  browseTree: AndroidAutoBrowseTree;
  updateBrowseTree: (t: Partial<AndroidAutoBrowseTree>) => void;
}

const defaultBrowseTree: AndroidAutoBrowseTree = {
  '/': [
    {
      mediaId: 'PlaylistTab',
      title: 'Playlists',
      playable: '1',
    },
    {
      mediaId: 'CurrentPlaylist',
      title: 'Current',
      playable: '1',
    },
  ],
  PlaylistTab: [],
};

export const initAA = () => TrackPlayer.setBrowseTree(defaultBrowseTree);

const store: StateCreator<AndroidAutoStore, [], [], AndroidAutoStore> = (
  set,
  get,
) => ({
  browseTree: defaultBrowseTree,
  updateBrowseTree: t => {
    const newBrowseTree = {
      ...get().browseTree,
      ...t,
    } as AndroidAutoBrowseTree;
    set({ browseTree: newBrowseTree });
    TrackPlayer.setBrowseTree(newBrowseTree);
  },
});

export default store;
