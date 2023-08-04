// vanilla store of zustand serving playbackServices.
import { createStore } from 'zustand/vanilla';
import { NoxRepeatMode } from '../enums/RepeatMode';

interface NoxPlaylistStore {
  playingList: Array<NoxMedia.Song>;
  playingListShuffled: Array<NoxMedia.Song>;
  playmode: string;
}

const playlistStore = createStore<NoxPlaylistStore>(() => ({
  playingList: [],
  playingListShuffled: [],
  playmode: NoxRepeatMode.SHUFFLE,
}));

export const setPlayingList = (list: Array<NoxMedia.Song>) => {
  playlistStore.setState({
    playingList: list,
    playingListShuffled: [...list].sort(() => Math.random() - 0.5),
  });
};

export const getCurrentTPQueue = () => {
  const state = playlistStore.getState();
  if (state.playmode === NoxRepeatMode.SHUFFLE) {
    return state.playingListShuffled;
  }
  return state.playingList;
};

export default playlistStore;
// const { getState, setState } =
