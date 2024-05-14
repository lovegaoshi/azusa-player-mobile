// vanilla store of zustand serving playbackServices.
import { createStore } from 'zustand/vanilla';
import TrackPlayer, { RepeatMode } from 'react-native-track-player';

import { clearPlaylistUninterrupted } from '@utils/RNTPUtils';
import { NoxRepeatMode } from '../enums/RepeatMode';
import { savePlayMode } from '@utils/ChromeStorage';
import logger from '@utils/Logger';

interface NoxPlaylistStore {
  playingList: NoxMedia.Song[];
  playingListShuffled: NoxMedia.Song[];
  currentPlayingIndex: number;
  // TODO: depreciate useApp's currentPlayingId
  // watch out for the things needed to be added like
  // saveLastPlayedSongId, etc  set in useApp.
  currentPlayingId: string;
  playmode: NoxRepeatMode;
}

const playlistStore = createStore<NoxPlaylistStore>(() => ({
  playingList: [],
  playingListShuffled: [],
  currentPlayingIndex: -1,
  currentPlayingId: '',
  playmode: NoxRepeatMode.Shuffle,
}));

export const setPlayingIndex = (index = 0, songId?: string) => {
  const currentQueue = getCurrentTPQueue();
  if (songId) {
    index = currentQueue.findIndex(v => v.id === songId);
  } else {
    try {
      songId = currentQueue[index].id;
    } catch {
      logger.warn(
        `[setPlayingIndex] could not get index ${index} from current queue: ${JSON.stringify(currentQueue)} `
      );
      return;
    }
  }
  playlistStore.setState({
    currentPlayingIndex: index,
    currentPlayingId: songId,
  });
};

/**
 * WARN: actually moves currentPlayingIndex
 */
export const playNextIndex = (direction = 1, set = true) => {
  const { currentPlayingIndex, playingList } = playlistStore.getState();
  let newIndex = currentPlayingIndex + direction;
  if (newIndex < 0) {
    newIndex = playingList.length - 1;
  } else if (newIndex >= playingList.length) {
    newIndex = 0;
  }
  if (set) setPlayingIndex(newIndex);
  return newIndex;
};

export const playNextSong = (direction = 1, set = true) =>
  getCurrentTPQueue()[playNextIndex(direction, set)];

export const setPlayingList = (list: NoxMedia.Song[]) => {
  playlistStore.setState({
    playingList: list,
    playingListShuffled: [...list].sort(() => Math.random() - 0.5),
  });
};

export const getCurrentTPQueue = (playmode?: NoxRepeatMode) => {
  const state = playlistStore.getState();
  if (!playmode) playmode = state.playmode;
  if (playmode === NoxRepeatMode.Shuffle) {
    return state.playingListShuffled;
  }
  return state.playingList;
};

export const getNextSong = (song: NoxMedia.Song) => {
  const songId = song.id;
  const queue = getCurrentTPQueue();
  const index = queue.findIndex(val => val.id === songId) + 1;
  if (index === 0) {
    return;
  }
  if (index >= queue.length) {
    return queue[0];
  }
  return queue[index];
};

export const getPlaybackModeNotifIcon = (
  state?: string
): [number, RepeatMode] => {
  let nextIcon = 2;
  if (!state) {
    state = playlistStore.getState().playmode;
  }
  // NOTE: DO NOT CHANGE THIS TO OTHER MODES!
  // APM uses zustand handles queue so it relies on
  // RepeatMode.Off to properly trigger PlaybackQueueEnded
  // and call zustand to load the next song in queue. this must be
  // RepeatMode.Off.
  let TPRepeatMode = RepeatMode.Off;
  switch (state) {
    case NoxRepeatMode.Repeat:
      nextIcon = 2;
      break;
    case NoxRepeatMode.RepeatTrack:
      nextIcon = 3;
      TPRepeatMode = RepeatMode.Track;
      break;
    case NoxRepeatMode.Suggest:
      nextIcon = 5;
      break;
    case NoxRepeatMode.Shuffle:
      nextIcon = 4;
      break;
    default:
      break;
  }
  return [nextIcon, TPRepeatMode];
};

const RefreshPlayingIndex = [NoxRepeatMode.Shuffle, NoxRepeatMode.Repeat];
/**
 * calls TP.setRepeatMode by the input repeat mode, saves repeat mode into asnycStorage, then
 * returns the icon associated with the repeat mode (for notification bar).
 */
export const initializePlaybackMode = (state: NoxRepeatMode) => {
  const [nextIcon, TPRepeatMode] = getPlaybackModeNotifIcon(state);
  playlistStore.setState({ playmode: state });
  if (RefreshPlayingIndex.includes(state)) {
    setPlayingIndex(0, playlistStore.getState().currentPlayingId);
    clearPlaylistUninterrupted();
  }
  savePlayMode(state);
  TrackPlayer.setRepeatMode(TPRepeatMode);
  return nextIcon;
};

/**
 * determines the next playback mode and cycle to the next mode.
 */
export const cycleThroughPlaymode = () => {
  switch (playlistStore.getState().playmode) {
    case NoxRepeatMode.Shuffle:
      return initializePlaybackMode(NoxRepeatMode.Repeat);
    case NoxRepeatMode.Repeat:
      return initializePlaybackMode(NoxRepeatMode.RepeatTrack);
    case NoxRepeatMode.RepeatTrack:
      return initializePlaybackMode(NoxRepeatMode.Suggest);
    case NoxRepeatMode.Suggest:
      return initializePlaybackMode(NoxRepeatMode.Shuffle);
    default:
      return undefined;
  }
};

export default playlistStore;
