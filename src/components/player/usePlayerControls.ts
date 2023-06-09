import TrackPlayer from 'react-native-track-player';
import { biliSuggest } from '../../utils/Bilibili/BiliOperate';
import { useNoxSetting } from '../../hooks/useSetting';
import { songlistToTracklist } from '../../objects/Playlist';
import noxPlayingList, { getCurrentTPQueue } from '../../stores/playingList';
import biliavideo from '../../utils/mediafetch/biliavideo';
import { randomChoice } from '../../utils/Utils';
import { NoxRepeatMode } from './enums/RepeatMode';

const { getState } = noxPlayingList;

export default () => {
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const findCurrentPlayIndex = () => {
    return getCurrentTPQueue().findIndex(val => val.id === currentPlayingId);
  };

  const getBiliSuggest = async () => {
    const currentSong = (await TrackPlayer.getActiveTrack())?.song;
    if (!currentSong || !currentSong.bvid.startsWith('BV')) {
      throw new Error('not a bvid; bilisuggest fails');
    }
    return biliavideo.regexFetch({
      reExtracted: [
        '',
        randomChoice(await biliSuggest(currentSong.bvid)).aid,
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

  const performSkipToNext = async () => {
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

  const performSkipToPrevious = async () => {
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

  return {
    performSkipToNext,
    performSkipToPrevious,
  };
};
