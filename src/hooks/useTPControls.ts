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
import logger from '@utils/Logger';

const setAppStore = appStore.setState;
const regexResolveURLs: NoxUtils.RegexMatchSuggest<NoxMedia.Song> = [
  [ytbvideoFetch.regexResolveURLMatch, ytbvideoFetch.suggest],
  [ytbvideoFetch.regexResolveURLMatch2, ytbvideoFetch.suggest],
];
const regexResolveURLsYTM: NoxUtils.RegexMatchSuggest<NoxMedia.Song> = [
  [ytbvideoFetch.regexResolveURLMatch, ytbvideoFetch.suggestYTM],
  [ytbvideoFetch.regexResolveURLMatch2, ytbvideoFetch.suggestYTM],
];
// 130,音乐综合 29,音乐现场 59,演奏 31,翻唱 193,MV 30,VOCALOID·UTAU 194,电音 28,原创音乐
const musicTids = [130, 29, 59, 31, 193, 30, 194, 28];

interface GetBiliSuggest {
  skipLongVideo?: boolean;
  preferYTM?: boolean;
}
const getBiliSuggest = async ({
  skipLongVideo = true,
  preferYTM = true,
}: GetBiliSuggest) => {
  const finalRegexResolveURLs = preferYTM
    ? regexResolveURLsYTM
    : regexResolveURLs;
  const currentSong = (await TrackPlayer.getActiveTrack())?.song;
  if (!currentSong) throw new Error('[PlaySuggest] currenSong is not valid!');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterMW = (v: any[]) => {
    let list = v;
    if (skipLongVideo) {
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
      musicTids.includes(val.tid),
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
    regexOperations: finalRegexResolveURLs.map(resolver => [
      resolver[0],
      (song: NoxMedia.Song) => resolver[1](song, filterMW),
    ]),
    fallback,
    regexMatching: song => song.id,
  });
};

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
    }),
  ];
  if (next) {
    await TrackPlayer.add(await songlistToTracklist(suggestedSong));
    return;
  }
  await TrackPlayer.add(await songlistToTracklist(suggestedSong), 0);
};

const prepareSkipToNext = async (mSkipToBiliSuggest = skipToBiliSuggest) => {
  const nextSong = playNextSong();
  if (
    nextSong &&
    (await TrackPlayer.getActiveTrackIndex()) ===
      (await TrackPlayer.getQueue()).length - 1
  ) {
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
  const callback = () =>
    preparePromise().then(async () => {
      await TrackPlayer.skipToNext();
      TrackPlayer.play();
    });
  mPerformFade(callback);
};

export const performSkipToPrevious = (
  preparePromise = prepareSkipToPrevious,
  mPerformFade = performFade,
) => {
  const callback = () =>
    preparePromise().then(async () => {
      await TrackPlayer.skipToPrevious();
      TrackPlayer.play();
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
