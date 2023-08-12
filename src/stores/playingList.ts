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

export const getNextSong = (song: NoxMedia.Song) => {
  const songId = song.id;
  const queue = getCurrentTPQueue();
  const index = queue.findIndex(val => val.id === songId) + 1;
  if (index === 0) {
    return null;
  }
  if (index >= queue.length) {
    return queue[0];
  }
  return queue[index];
};

export default playlistStore;
// const { getState, setState } =
