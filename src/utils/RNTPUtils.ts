import { Animated, Platform, AppState } from 'react-native';
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  UpdateOptions,
  Track,
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

const { getState, setState } = appStore;
const animatedVolume = new Animated.Value(1);
const NULL_TRACK = { url: 'NULL', urlRefreshTimeStamp: 0 };

animatedVolume.addListener(state => TrackPlayer.setVolume(state.value));

interface animatedVolumeChangeProps {
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
}: animatedVolumeChangeProps) => {
  logger.debug(
    `[FADING] animating volume from ${init} to ${val} in ${duration}; ${AppState.currentState}`
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
  keepForeground?: boolean;
}
/**
 * see export function useSetupPlayer.
 * wait SetupService(serviceOptions) is called after await initPlayer(await initPlayerObject())
 * and because initializePlaybackMode(val.playbackMode) is called within initPlayer
 * playlistStore.playmode is already set
 * this should return the correct icon for playback mode.
 */
export const initRNTPOptions = ({ keepForeground = false }: RNTPOptions) => {
  const options: UpdateOptions = {
    android: {
      appKilledPlaybackBehavior:
        AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      stopForegroundGracePeriod: keepForeground ? 99999999 : 5,
    },
    // This flag is now deprecated. Please use the above to define playback mode.
    // stoppingAppPausesPlayback: true,
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
    ],
    compactCapabilities: [
      Capability.Play,
      Capability.SkipToPrevious,
      Capability.SkipToNext,
      Capability.SeekTo,
    ],
    notificationCapabilities: [
      Capability.Play,
      Capability.SkipToPrevious,
      Capability.SkipToNext,
      Capability.SeekTo,
    ],
    progressUpdateEventInterval: 1,
  };
  if (Platform.OS === 'android') {
    options.capabilities = options.capabilities!.concat([
      Capability.JumpBackward,
      Capability.JumpForward,
    ]);
    options.notificationCapabilities = options.notificationCapabilities!.concat(
      [Capability.JumpBackward, Capability.JumpForward]
    );
    options.forwardJumpInterval = 1;
    options.backwardJumpInterval = 1;
    options.rewindIcon = getPlaybackModeNotifIcon()[0];
    options.forwardIcon = 0;
    /**
    options.customActions = {
      customActionsList: ['customForward', 'customBackward'],
      customForward: getPlaybackModeNotifIcon()[0],
      customBackward: getPlaybackModeNotifIcon()[0],
    };
    */
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
  const rewindIcon = cyclePlaymode();
  if (Platform.OS === 'android') {
    const newRNTPOptions = {
      ...getState().RNTPOptions,
      rewindIcon,
    };
    TrackPlayer.updateOptions(newRNTPOptions);
    setState({ RNTPOptions: newRNTPOptions });
  }
};

interface ResolveAndCache {
  song: NoxMedia.Song;
  dry?: boolean;
  resolver?: (
    v: NoxUtils.SongProcessor
  ) => Promise<NoxNetwork.ParsedNoxMediaURL>;
}
export const resolveAndCache = async ({
  song,
  dry = false,
  resolver = resolveUrl,
}: ResolveAndCache) => {
  const resolvedUrl = await resolver({ song });
  logger.debug(`[resolver] resolved ${song.bvid} to ${resolvedUrl.url}`);
  // a dry run doesnt cache to disk, but does resolve to the cached map.
  if (dry) return resolvedUrl;
  const { downloadPromiseMap, fadeIntervalMs } = getState();
  const previousDownloadProgress =
    downloadPromiseMap[song.id] ||
    addDownloadPromise(
      song,
      NoxCache.noxMediaCache?.saveCacheMedia(song, resolvedUrl)
    );
  previousDownloadProgress.then(() => {
    logger.debug(
      `[cache] ${song.parsedName} completed. now clearing cache and set R128gain...`
    );
    parseSongR128gain(song, fadeIntervalMs);
    resetResolvedURL(song);
  });
  return resolvedUrl;
};
export const songlistToTracklist = async (
  songList: NoxMedia.Song[]
): Promise<Track[]> => {
  return Promise.all(
    songList.map(async song => {
      const resolvedUrl = await resolveAndCache({ song });
      return {
        ...NULL_TRACK,
        title: song.parsedName,
        artist: song.singer,
        artwork:
          song.cover.length > 0 ? i0hdslbHTTPResolve(song.cover) : undefined,
        duration: song.duration,
        song: song,
        isLiveStream: song.isLive,
        // TODO: add a throttler here
        ...resolvedUrl,
      };
    })
  );
};

export const clearPlaylistUninterrupted = async () => {
  const currentQueue = await TrackPlayer.getQueue();
  const currentTrackIndex = await TrackPlayer.getActiveTrackIndex();
  if (currentTrackIndex === undefined) return;
  const removeTrackIndices = [...Array(currentQueue.length).keys()];
  removeTrackIndices.splice(currentTrackIndex, 1);
  await TrackPlayer.remove(removeTrackIndices);
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
