import { StateCreator } from 'zustand';
import TrackPlayer, { AndroidAutoBrowseTree } from 'react-native-track-player';

// zustand store slice template.

export interface AndroidAutoStore {
  browseTree: AndroidAutoBrowseTree;
  updateBrowseTree: (t: AndroidAutoBrowseTree) => void;
}

const store: StateCreator<AndroidAutoStore, [], [], AndroidAutoStore> = (
  set,
  get,
) => ({
  browseTree: { '/': [] },
  updateBrowseTree: t => {
    const newBrowseTree = { ...get().browseTree, ...t };
    set({ browseTree: newBrowseTree });
    TrackPlayer.setBrowseTree(newBrowseTree);
  },
});

export default store;
