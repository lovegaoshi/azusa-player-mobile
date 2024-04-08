// vanilla store of zustand serving playbackServices.
import { createStore } from 'zustand/vanilla';
import TrackPlayer, { RepeatMode } from 'react-native-track-player';

import { clearPlaylistUninterrupted } from '@utils/RNTPUtils';
import { savePlayMode } from '@utils/ChromeStorage';
import logger from '@utils/Logger';

interface NoxPlaylistStore {
  playingList: Array<NoxMedia.Song>;
  playingListShuffled: Array<NoxMedia.Song>;
  currentPlayingIndex: number;
  // TODO: depreciate useApp's currentPlayingId
  // watch out for the things needed to be added like
  // saveLastPlayedSongId, etc  set in useApp.
  currentPlayingId: string;
  playmode: NoxEnum.RNTP.NoxRepeatMode;
}

const playlistStore = createStore<NoxPlaylistStore>(() => ({
  playingList: [],
  playingListShuffled: [],
  currentPlayingIndex: -1,
  currentPlayingId: '',
  playmode: NoxEnum.RNTP.NoxRepeatMode.SHUFFLE,
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
 * @param direction
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

export const setPlayingList = (list: Array<NoxMedia.Song>) => {
  playlistStore.setState({
    playingList: list,
    playingListShuffled: [...list].sort(() => Math.random() - 0.5),
  });
};

export const getCurrentTPQueue = (playmode?: NoxEnum.RNTP.NoxRepeatMode) => {
  const state = playlistStore.getState();
  if (!playmode) playmode = state.playmode;
  if (playmode === NoxEnum.RNTP.NoxRepeatMode.SHUFFLE) {
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
    case NoxEnum.RNTP.NoxRepeatMode.REPEAT:
      nextIcon = 2;
      break;
    case NoxEnum.RNTP.NoxRepeatMode.REPEAT_TRACK:
      nextIcon = 3;
      TPRepeatMode = RepeatMode.Track;
      break;
    case NoxEnum.RNTP.NoxRepeatMode.SUGGEST:
      nextIcon = 5;
      break;
    case NoxEnum.RNTP.NoxRepeatMode.SHUFFLE:
      nextIcon = 4;
      break;
    default:
      break;
  }
  return [nextIcon, TPRepeatMode];
};

const RefreshPlayingIndex = [
  NoxEnum.RNTP.NoxRepeatMode.SHUFFLE,
  NoxEnum.RNTP.NoxRepeatMode.REPEAT,
];
/**
 * calls TP.setRepeatMode by the input repeat mode, saves repeat mode into asnycStorage, then
 * returns the icon associated with the repeat mode (for notification bar).
 */
export const initializePlaybackMode = (state: NoxEnum.RNTP.NoxRepeatMode) => {
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
    case NoxEnum.RNTP.NoxRepeatMode.SHUFFLE:
      return initializePlaybackMode(NoxEnum.RNTP.NoxRepeatMode.REPEAT);
    case NoxEnum.RNTP.NoxRepeatMode.REPEAT:
      return initializePlaybackMode(NoxEnum.RNTP.NoxRepeatMode.REPEAT_TRACK);
    case NoxEnum.RNTP.NoxRepeatMode.REPEAT_TRACK:
      return initializePlaybackMode(NoxEnum.RNTP.NoxRepeatMode.SUGGEST);
    case NoxEnum.RNTP.NoxRepeatMode.SUGGEST:
      return initializePlaybackMode(NoxEnum.RNTP.NoxRepeatMode.SHUFFLE);
    default:
      return undefined;
  }
};

export default playlistStore;
