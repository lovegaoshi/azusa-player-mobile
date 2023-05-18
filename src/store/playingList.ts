// vanilla store of zustand serving playbackServices.
import { createStore } from 'zustand/vanilla';

interface NoxPlaylistStore {
  playingList: Array<NoxMedia.Song>;
  playingListShuffled: Array<NoxMedia.Song>;
}

export default createStore<NoxPlaylistStore>(() => ({
  playingList: [],
  playingListShuffled: [],
}));

// const { getState, setState } =
