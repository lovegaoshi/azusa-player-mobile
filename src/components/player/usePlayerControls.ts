import TrackPlayer from 'react-native-track-player';
import { useStore } from 'zustand';

import { biliSuggest } from '@utils/Bilibili/BiliOperate';
import { useNoxSetting } from '@hooks/useSetting';
import { songlistToTracklist } from '@objects/Playlist';
import noxPlayingList, { getCurrentTPQueue } from '@stores/playingList';
import biliavideo from '@utils/mediafetch/biliavideo';
import { randomChoice } from '@utils/Utils';
import { NoxRepeatMode } from '@enums/RepeatMode';
import { animatedVolumeChange } from '@utils/RNTPUtils';
import appStore from '@stores/appStore';

const { getState } = noxPlayingList;

export default () => {
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const findCurrentPlayIndex = () => {
    return getCurrentTPQueue().findIndex(val => val.id === currentPlayingId);
  };
  const fadeIntervalMs = useStore(appStore, state => state.fadeIntervalMs);

  const getBiliSuggest = async () => {
    const currentSong = (await TrackPlayer.getActiveTrack())?.song;
    if (!currentSong || !currentSong.bvid.startsWith('BV')) {
      throw new Error('not a bvid; bilisuggest fails');
    }
    // 130,音乐综合 29,音乐现场 59,演奏 31,翻唱 193,MV 30,VOCALOID·UTAU 194,电音 28,原创音乐
    const musicTids = [130, 29, 59, 31, 193, 30, 194, 28];
    const biliSuggested = (await biliSuggest(currentSong.bvid)).filter(val =>
      musicTids.includes(val.tid)
    );
    return biliavideo.regexFetch({
      reExtracted: [
        '',
        randomChoice(biliSuggested).aid,
        // HACK: sure sure regexpexecarray
      ] as unknown as RegExpExecArray,
    });
  };

  const skipToBiliSuggest = async (next = true) => {
    if (getState().playmode !== NoxRepeatMode.SUGGEST) {
      throw new Error('playmode is not bilisuggest.');
    }
    const suggestedSong = await getBiliSuggest();
    if (next) {
      await TrackPlayer.add(songlistToTracklist(suggestedSong));
      return;
    }
    await TrackPlayer.add(songlistToTracklist(suggestedSong), 0);
  };

  const performSkipToNextRaw = async () => {
    if (
      (await TrackPlayer.getActiveTrackIndex()) ===
      (await TrackPlayer.getQueue()).length - 1
    ) {
      const currentTPQueue = getCurrentTPQueue();
      let nextIndex = findCurrentPlayIndex() + 1;
      if (nextIndex > currentTPQueue.length - 1) {
        nextIndex = 0;
      }
      try {
        await skipToBiliSuggest();
      } catch {
        await TrackPlayer.add(songlistToTracklist([currentTPQueue[nextIndex]]));
      }
    }
    TrackPlayer.skipToNext();
    // setTP2Song(getCurrentTPQueue()[nextIndex]);
  };

  const performSkipToPreviousRaw = async () => {
    if ((await TrackPlayer.getActiveTrackIndex()) === 0) {
      const currentTPQueue = getCurrentTPQueue();
      let nextIndex = findCurrentPlayIndex() - 1;
      if (nextIndex < 0) {
        nextIndex = currentTPQueue.length - 1;
      }
      try {
        await skipToBiliSuggest(false);
      } catch {
        await TrackPlayer.add(
          songlistToTracklist([currentTPQueue[nextIndex]]),
          0
        );
      }
    }
    TrackPlayer.skipToPrevious();
    // setTP2Song(getCurrentTPQueue()[nextIndex]);
  };

  const performSkipToNext = () => {
    animatedVolumeChange({
      val: 0,
      duration: fadeIntervalMs,
      callback: performSkipToNextRaw,
    });
  };

  const performSkipToPrevious = () => {
    animatedVolumeChange({
      val: 0,
      duration: fadeIntervalMs,
      callback: performSkipToPreviousRaw,
    });
  };

  return {
    performSkipToNext,
    performSkipToPrevious,
  };
};
