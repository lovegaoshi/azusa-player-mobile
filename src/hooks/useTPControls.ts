import TrackPlayer, { State } from 'react-native-track-player';
import { useStore } from 'zustand';

import { biliSuggest } from '@utils/Bilibili/BiliOperate';
import { useNoxSetting } from '@stores/useApp';
import noxPlayingList, { playNextSong } from '@stores/playingList';
import biliavideo from '@utils/mediafetch/biliavideo';
import { randomChoice, regexMatchOperations } from '@utils/Utils';
import { NoxRepeatMode } from '@enums/RepeatMode';
import { songlistToTracklist } from '@utils/RNTPUtils';
import appStore from '@stores/appStore';
import ytbvideoFetch from '@utils/mediafetch/ytbvideo';

const setAppStore = appStore.setState;
const regexResolveURLs: NoxUtils.RegexMatchSuggest<NoxMedia.Song> = [
  [ytbvideoFetch.regexResolveURLMatch, ytbvideoFetch.suggest],
];
// 130,音乐综合 29,音乐现场 59,演奏 31,翻唱 193,MV 30,VOCALOID·UTAU 194,电音 28,原创音乐
const musicTids = [130, 29, 59, 31, 193, 30, 194, 28];

export default () => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const fadeIntervalMs = useStore(appStore, state => state.fadeIntervalMs);

  const getBiliSuggest = async () => {
    const currentSong = (await TrackPlayer.getActiveTrack())?.song;
    if (!currentSong) throw new Error('[PlaySuggest] currenSong is not valid!');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filterMW = (v: any[]) => {
      let list = v;
      if (playerSetting.suggestedSkipLongVideo) {
        list = v.filter(song => song.duration < 600);
        if (list.length === 0) {
          list = v;
        }
      }
      return randomChoice(list);
    };

    const fallback = async () => {
      if (!currentSong.bvid.startsWith('BV')) {
        throw new Error('not a bvid; bilisuggest fails');
      }
      const biliSuggested = (await biliSuggest(currentSong.bvid)).filter(val =>
        musicTids.includes(val.tid)
      );
      return (
        await biliavideo.regexFetch({
          reExtracted: [
            '',
            filterMW(biliSuggested).aid,
            // HACK: sure sure regexpexecarray
          ] as unknown as RegExpExecArray,
        })
      ).songList[0];
    };

    return regexMatchOperations({
      song: currentSong,
      regexOperations: regexResolveURLs.map(resolver => [
        resolver[0],
        (song: NoxMedia.Song) => resolver[1](song, filterMW),
      ]),
      fallback,
      regexMatching: song => song.id,
    });
  };

  const skipToBiliSuggest = async (next = true) => {
    if (noxPlayingList.getState().playmode !== NoxRepeatMode.SUGGEST) {
      throw new Error('playmode is not bilisuggest.');
    }
    const suggestedSong = [await getBiliSuggest()];
    if (next) {
      await TrackPlayer.add(await songlistToTracklist(suggestedSong));
      return;
    }
    await TrackPlayer.add(await songlistToTracklist(suggestedSong), 0);
  };

  const prepareSkipToNext = async () => {
    const nextSong = playNextSong();
    if (
      (await TrackPlayer.getActiveTrackIndex()) ===
      (await TrackPlayer.getQueue()).length - 1
    ) {
      try {
        await skipToBiliSuggest();
      } catch {
        // TODO: this will just grow infinitely. WTF was i thinking?
        await TrackPlayer.add(await songlistToTracklist([nextSong]));
      }
    }
  };

  const prepareSkipToPrevious = async () => {
    const nextSong = playNextSong(-1);
    if ((await TrackPlayer.getActiveTrackIndex()) === 0) {
      try {
        await skipToBiliSuggest(false);
      } catch {
        await TrackPlayer.add(await songlistToTracklist([nextSong]), 0);
      }
    }
  };

  const preformFade = async (callback: () => void) => {
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

  const performSkipToNext = () => {
    const preparePromise = prepareSkipToNext();
    const callback = () =>
      preparePromise.then(async () => {
        await TrackPlayer.skipToNext();
        TrackPlayer.play();
      });
    preformFade(callback);
  };

  const performSkipToPrevious = () => {
    const preparePromise = prepareSkipToPrevious();
    const callback = () =>
      preparePromise.then(async () => {
        await TrackPlayer.skipToPrevious();
        TrackPlayer.play();
      });
    preformFade(callback);
  };

  return {
    preformFade,
    performSkipToNext,
    performSkipToPrevious,
  };
};
