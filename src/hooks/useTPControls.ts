import TrackPlayer, { State } from 'react-native-track-player';
import { useStore } from 'zustand';

import { useNoxSetting } from '@stores/useApp';
import noxPlayingList, {
  autoShuffleQueue,
  playNextSong,
} from '@stores/playingList';
import { NoxRepeatMode } from '@enums/RepeatMode';
import { songlistToTracklist } from '@utils/RNTPUtils';
import appStore from '@stores/appStore';
import logger from '@utils/Logger';
import { increasePlaybackCount } from '@utils/db/sqlStorage';
import getBiliSuggest from '@utils/mediafetch/suggestfetch';
import smarterShuffle from '@utils/shuffle';
import { TPPlay } from '@stores/RNObserverStore';

const setAppStore = appStore.setState;
const skipToBiliSuggest = async (
  next = true,
  playlistSetting = useNoxSetting.getState().playerSetting,
) => {
  if (noxPlayingList.getState().playmode !== NoxRepeatMode.Suggest) {
    throw new Error('playmode is not bilisuggest.');
  }
  const suggestedSong = [
    await getBiliSuggest({
      skipLongVideo: playlistSetting.suggestedSkipLongVideo,
      preferYTM: playlistSetting.preferYTMSuggest,
      currentSong: (await TrackPlayer.getActiveTrack())?.song,
    }),
  ];
  if (next) {
    await TrackPlayer.add(await songlistToTracklist(suggestedSong));
    return;
  }
  await TrackPlayer.add(await songlistToTracklist(suggestedSong), 0);
};

const prepareSkipToNext = async (mSkipToBiliSuggest = skipToBiliSuggest) => {
  const TPQueueLength = (await TrackPlayer.getQueue()).length;
  const nextSong = playNextSong();
  if ((await TrackPlayer.getActiveTrackIndex()) === TPQueueLength - 1) {
    const { playerSetting } = useNoxSetting.getState();
    autoShuffleQueue(
      TPQueueLength + 1,
      smarterShuffle(playerSetting.smartShuffle),
    );
    if (!nextSong) {
      return;
    }
    try {
      await mSkipToBiliSuggest();
    } catch {
      // TODO: this will just grow infinitely. WTF was i thinking?
      await TrackPlayer.add(await songlistToTracklist([nextSong]));
    }
  }
};

const prepareSkipToPrevious = async (
  mSkipToBiliSuggest = skipToBiliSuggest,
) => {
  const nextSong = playNextSong(-1);
  if (nextSong && (await TrackPlayer.getActiveTrackIndex()) === 0) {
    try {
      await mSkipToBiliSuggest(false);
    } catch {
      await TrackPlayer.add(await songlistToTracklist([nextSong]), 0);
    }
  }
};

export const performFade = async (
  callback: () => void,
  fadeIntervalMs = appStore.getState().fadeIntervalMs,
) => {
  const isPlaying = await TrackPlayer.getPlaybackState();
  if (isPlaying.state === State.Playing) {
    TrackPlayer.setAnimatedVolume({
      volume: 0,
      duration: fadeIntervalMs,
      callback,
    });
    setAppStore({ animatedVolumeChangedCallback: callback });
  } else {
    callback();
  }
};

export const performSkipToNext = (
  auto = false,
  noRepeat = useNoxSetting.getState().playerSetting.noRepeat,
  preparePromise = prepareSkipToNext,
  mPerformFade = performFade,
) => {
  if (auto && noRepeat) {
    logger.debug('[autoRepeat] stopping playback as autoRepeat is set to off');
    return;
  }
  if (!auto) {
    TrackPlayer.getActiveTrack().then(t =>
      increasePlaybackCount(t?.song?.id, -1),
    );
  }
  const callback = () =>
    preparePromise().then(async () => {
      // await TrackPlayer.skipToNext();
      const queueLen = (await TrackPlayer.getQueue()).length;
      await TrackPlayer.skip(queueLen - 1);
      TPPlay();
    });
  mPerformFade(callback);
};

export const performSkipToPrevious = (
  preparePromise = prepareSkipToPrevious,
  mPerformFade = performFade,
) => {
  TrackPlayer.getActiveTrack().then(t =>
    increasePlaybackCount(t?.song?.id, -1),
  );
  const callback = () =>
    preparePromise().then(async () => {
      await TrackPlayer.skipToPrevious();
      TPPlay();
    });
  mPerformFade(callback);
};

export default () => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const fadeIntervalMs = useStore(appStore, state => state.fadeIntervalMs);

  const mSkipToBiliSuggest = (next = true) =>
    skipToBiliSuggest(next, playerSetting);

  const mPerformFade = (callback: () => void) =>
    performFade(callback, fadeIntervalMs);

  return {
    performFade: (callback: () => void) =>
      performFade(callback, fadeIntervalMs),
    prepareSkipToNext: () => prepareSkipToNext(mSkipToBiliSuggest),
    performSkipToNext: (auto = false) =>
      performSkipToNext(
        auto,
        playerSetting.noRepeat,
        () => prepareSkipToNext(mSkipToBiliSuggest),
        mPerformFade,
      ),
    performSkipToPrevious: () =>
      performSkipToPrevious(
        () => prepareSkipToPrevious(mSkipToBiliSuggest),
        mPerformFade,
      ),
  };
};
