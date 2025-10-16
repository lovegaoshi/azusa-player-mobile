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
  } else {
    await TrackPlayer.add(await songlistToTracklist(suggestedSong), 0);
  }
  return suggestedSong[0];
};

const prepareSkipToNext = async (
  mSkipToBiliSuggest = skipToBiliSuggest,
  set = true,
) => {
  const TPQueue = await TrackPlayer.getQueue();
  const TPQueueLength = TPQueue.length;
  const nextSong = playNextSong(1, set);
  const currentIndex = await TrackPlayer.getActiveTrackIndex();
  logger.debug(
    `[skipToNext] preparing skipToNext: ${currentIndex}/${TPQueueLength}, with ${nextSong?.parsedName}`,
  );
  if (currentIndex === TPQueueLength - 1) {
    const { playerSetting } = useNoxSetting.getState();
    autoShuffleQueue(
      TPQueueLength + 1,
      smarterShuffle(playerSetting.smartShuffle),
    );
    if (!nextSong) {
      return;
    }
    try {
      return await mSkipToBiliSuggest();
    } catch {
      logger.debug(
        `[skipToNext] adding song ${nextSong.parsedName}/${nextSong.id}to TP queue`,
      );
      const resolved = await songlistToTracklist([nextSong]);
      // HACK: this grows indefinitely. luckily queue resets frequent enough that this should be fine
      await TrackPlayer.add(resolved);
    }
  } else {
    logger.debugR(
      () =>
        '[skipToNext] currentQueue: ' +
        TPQueue.map(s => `${s.song.parsedName}/${s.song.id}`),
    );
  }
  return nextSong;
};

const prepareSkipToPrevious = async (
  mSkipToBiliSuggest = skipToBiliSuggest,
) => {
  const nextSong = playNextSong(-1);
  if (nextSong && (await TrackPlayer.getActiveTrackIndex()) === 0) {
    try {
      return await mSkipToBiliSuggest(false);
    } catch {
      await TrackPlayer.add(await songlistToTracklist([nextSong]), 0);
    }
  }
  return nextSong;
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
  logger.debug('[skipToNext] calling skipToNext');
  if (!auto) {
    TrackPlayer.getActiveTrack().then(t =>
      increasePlaybackCount(t?.song?.id, -1),
    );
  }
  const callback = () =>
    preparePromise().then(async () => {
      //await TrackPlayer.skipToNext();
      // WHY?
      const nextIndex = ((await TrackPlayer.getActiveTrackIndex()) ?? 0) + 1;
      let maxQueueLen = (await TrackPlayer.getQueue()).length - 1;
      if (nextIndex > maxQueueLen) {
        logger.error(
          '[skipToNext] failed to skip to next song. attempt to retry preparePromise',
        );
        await preparePromise();
        maxQueueLen = (await TrackPlayer.getQueue()).length - 1;
        logger.warn(`[skipToNext] current status: ${nextIndex}/${maxQueueLen}`);
      }
      // HACK: log when nextIndex > maxQueueLen here
      await TrackPlayer.skip(Math.min(nextIndex, maxQueueLen));
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

export default function useTPControl() {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const fadeIntervalMs = useStore(appStore, state => state.fadeIntervalMs);

  const mSkipToBiliSuggest = (next = true) =>
    skipToBiliSuggest(next, playerSetting);

  const mPerformFade = (callback: () => void) =>
    performFade(callback, fadeIntervalMs);

  return {
    performFade: (callback: () => void) =>
      performFade(callback, fadeIntervalMs),
    prepareSkipToNext: (set = true) =>
      prepareSkipToNext(mSkipToBiliSuggest, set),
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
}
