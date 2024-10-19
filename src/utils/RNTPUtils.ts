import { Animated, AppState } from 'react-native';
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  UpdateOptions,
  Track,
  TrackType,
} from 'react-native-track-player';

import { logger } from './Logger';
import appStore, {
  addDownloadPromise,
  resetResolvedURL,
} from '@stores/appStore';
import { getR128GainAsync } from './ffmpeg/r128RN';
import {
  cycleThroughPlaymode as cyclePlaymode,
  getPlaybackModeNotifIcon,
} from '@stores/playingList';
import { i0hdslbHTTPResolve } from '@utils/Utils';
import { resolveUrl, parseSongR128gain } from '@utils/SongOperations';
import NoxCache from './Cache';
import { setTPR128Gain } from './ffmpeg/ffmpeg';
import { NULL_TRACK } from '@objects/Song';
import { isAndroid, isIOS } from './RNUtils';

const { getState, setState } = appStore;
const animatedVolume = new Animated.Value(1);

animatedVolume.addListener(state => TrackPlayer.setVolume(state.value));

interface AnimatedVolumeChangeProps {
  val: number;
  duration?: number;
  init?: number;
  callback?: () => void;
}

/**
 * to use: duration is the fade interval,
 * when song starts/R128gain is set, set init = 0.
 */
export const animatedVolumeChange = ({
  val,
  duration = 0,
  init = -1,
  callback = () => undefined,
}: AnimatedVolumeChangeProps) => {
  logger.debug(
    `[FADING] animating volume from ${init} to ${val} in ${duration}; ${AppState.currentState}`,
  );
  if (AppState.currentState !== 'active') {
    // need to figure out a way to run Animated.timing in background. probably needs our own module
    duration = 0;
  }
  val = Math.min(val, 1);
  if (duration === 0) {
    animatedVolume.setValue(val);
    callback();
    return;
  }
  if (init !== -1) {
    animatedVolume.setValue(init);
  }
  animatedVolume.stopAnimation();
  Animated.timing(animatedVolume, {
    toValue: val,
    useNativeDriver: true,
    duration,
  }).start(() => callback());
};

interface RNTPOptions {
  audioOffload?: boolean;
  skipSilence?: boolean;
}
/**
 * see export function useSetupPlayer.
 * wait SetupService(serviceOptions) is called after await initPlayer(await initPlayerObject())
 * and because initializePlaybackMode(val.playbackMode) is called within initPlayer
 * playlistStore.playmode is already set
 * this should return the correct icon for playback mode.
 */
export const initRNTPOptions = ({ audioOffload, skipSilence }: RNTPOptions) => {
  const options: UpdateOptions = {
    android: {
      appKilledPlaybackBehavior:
        AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      audioOffload,
      androidSkipSilence: skipSilence,
    },
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
    ],
    progressUpdateEventInterval: 1,
  };
  if (isAndroid) {
    options.customActions = {
      customActionsList: ['customPlaymode', 'customFavorite'],
      customPlaymode: getPlaybackModeNotifIcon()[0],
      customFavorite: 0,
    };
  }
  return options;
};

export const fadePause = () =>
  TrackPlayer.fadeOutPause(getState().fadeIntervalMs);

export const fadePlay = async () => {
  const { fadeIntervalMs } = getState();
  setTPR128Gain(await getR128GainAsync(), fadeIntervalMs, 0);
};

export const cycleThroughPlaymode = () => {
  const customPlaymode = cyclePlaymode();
  if (isAndroid) {
    const oldOptions = getState().RNTPOptions;
    const newRNTPOptions = {
      ...oldOptions,
      customActions: oldOptions?.customActions
        ? {
            ...oldOptions!.customActions!,
            customPlaymode: customPlaymode ?? 0,
          }
        : undefined,
    };
    TrackPlayer.updateOptions(newRNTPOptions);
    setState({ RNTPOptions: newRNTPOptions });
  }
};

interface ResolveAndCache {
  song: NoxMedia.Song;
  dry?: boolean;
  resolver?: (
    v: NoxUtils.SongProcessor,
  ) => Promise<NoxNetwork.ResolvedNoxMediaURL>;
}

const _resolveAndCache = async ({
  song,
  dry = false,
  resolver = resolveUrl,
}: ResolveAndCache) => {
  const resolvedUrl = await resolver({ song, iOS: isIOS });
  logger.debug(`[resolver] resolved ${song.bvid} to ${resolvedUrl.url}`);
  // a dry run doesnt cache to disk, but does resolve to the cached map.
  if (dry) return { resolvedUrl };
  const { downloadPromiseMap, fadeIntervalMs } = getState();
  const previousDownloadProgress =
    downloadPromiseMap[song.id] ||
    addDownloadPromise(
      song,
      NoxCache.noxMediaCache?.saveCacheMedia(song, resolvedUrl),
    );
  previousDownloadProgress.then(() => {
    logger.debug(
      `[cache] ${song.parsedName} completed. now clearing cache and set R128gain...`,
    );
    parseSongR128gain(song, fadeIntervalMs);
    resetResolvedURL(song);
  });
  return {
    resolvedUrl,
    downloadPromise: previousDownloadProgress,
  };
};

export const resolveAndCache = async (p: ResolveAndCache) => {
  const { resolvedUrl } = await _resolveAndCache(p);
  return resolvedUrl;
};

export const resolveCachedPath = async (p: ResolveAndCache) => {
  const { downloadPromise } = await _resolveAndCache(p);
  return downloadPromise;
};

export const songlistToTracklist = async (
  songList: NoxMedia.Song[],
): Promise<Track[]> => {
  return Promise.all(
    songList.map(async song => {
      const resolvedUrl = await resolveAndCache({ song });
      const type = resolvedUrl.url.includes('.m3u8')
        ? TrackType.HLS
        : TrackType.Default;
      return {
        ...NULL_TRACK,
        title: song.parsedName,
        artist: song.singer,
        artwork:
          song.cover.length > 0 ? i0hdslbHTTPResolve(song.cover) : undefined,
        duration: song.duration,
        song: song,
        isLiveStream: song.isLive,
        type,
        mediaId: song.id,
        // TODO: add a throttler here
        ...resolvedUrl,
      };
    }),
  );
};

export const clearPlaylistUninterrupted = async () => {
  const currentQueue = await TrackPlayer.getQueue();
  const currentTrackIndex = await TrackPlayer.getActiveTrackIndex();
  if (currentTrackIndex === undefined) return;
  const removeTrackIndices = [...Array(currentQueue.length).keys()];
  removeTrackIndices.splice(currentTrackIndex, 1);
  try {
    await TrackPlayer.remove(removeTrackIndices);
  } catch (e) {
    logger.warn(
      `[RNTPUtils] claer Playlist failed as: ${e} with ${removeTrackIndices}; queue is ${currentQueue.length}`,
    );
  }
};

export const playSongUninterrupted = async (song: NoxMedia.Song) => {
  const currentQueue = await TrackPlayer.getQueue();
  await TrackPlayer.add(await songlistToTracklist([song]));
  await TrackPlayer.skip(currentQueue.length);
  await TrackPlayer.play();
};

export const playSongInterrupted = async (song: NoxMedia.Song) => {
  await TrackPlayer.reset();
  await TrackPlayer.add(await songlistToTracklist([song]));
  TrackPlayer.play();
};
