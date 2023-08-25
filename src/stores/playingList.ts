// vanilla store of zustand serving playbackServices.
import { createStore } from 'zustand/vanilla';
import TrackPlayer, { RepeatMode } from 'react-native-track-player';

import { NoxRepeatMode } from '../enums/RepeatMode';
import { savePlayMode } from '@utils/ChromeStorage';

interface NoxPlaylistStore {
  playingList: Array<NoxMedia.Song>;
  playingListShuffled: Array<NoxMedia.Song>;
  playmode: string;
  setPlaymode: (val: string) => void;
}

const playlistStore = createStore<NoxPlaylistStore>((set, get) => ({
  playingList: [],
  playingListShuffled: [],
  playmode: NoxRepeatMode.SHUFFLE,
  setPlaymode: (val: string) => set({ playmode: val }),
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

/**
 * calls TP.setRepeatMode by the input repeat mode, saves repeat mode into asnycStorage, then
 * returns the icon associated with the repeat mode (for notification bar).
 */
export const initializePlaybackMode = (state: string) => {
  let nextIcon;
  // NOTE: DO NOT CHANGE THIS TO OTHER MODES!
  // APM uses zustand handles queue so it relies on
  // RepeatMode.Off to properly trigger PlaybackQueueEnded
  // and call zustand to load the next song in queue. this must be
  // RepeatMode.Off.
  let TPRepeatMode = RepeatMode.Off;

  switch (state) {
    case NoxRepeatMode.REPEAT:
      nextIcon = require('@assets/icons/repeatModeRepeat.png');
      break;
    case NoxRepeatMode.REPEAT_TRACK:
      nextIcon = require('@assets/icons/repeatModeRepeatTrack.png');
      TPRepeatMode = RepeatMode.Track;
      break;
    case NoxRepeatMode.SUGGEST:
      nextIcon = require('@assets/icons/repeatModeSuggest.png');
      break;
    case NoxRepeatMode.SHUFFLE:
      nextIcon = require('@assets/icons/repeatModeShuffle.png');
      break;
    default:
      break;
  }
  TrackPlayer.setRepeatMode(TPRepeatMode);
  savePlayMode(state);
  return nextIcon;
};

/**
 * determines the next playback mode and cycle to the next mode.
 */
export const cycleThroughPlaymode = () => {
  let nextState;
  switch (playlistStore.getState().playmode) {
    case NoxRepeatMode.SHUFFLE:
      nextState = NoxRepeatMode.REPEAT;
      break;
    case NoxRepeatMode.REPEAT:
      nextState = NoxRepeatMode.REPEAT_TRACK;
      break;
    case NoxRepeatMode.REPEAT_TRACK:
      nextState = NoxRepeatMode.SUGGEST;
      break;
    case NoxRepeatMode.SUGGEST:
      nextState = NoxRepeatMode.SHUFFLE;
      break;
    default:
      break;
  }
  if (nextState) {
    playlistStore.setState({ playmode: nextState });
    return initializePlaybackMode(nextState);
  }
  return null;
};

export default playlistStore;
