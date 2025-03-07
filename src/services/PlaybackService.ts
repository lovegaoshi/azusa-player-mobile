import TrackPlayer, {
  Event,
  State,
  RepeatMode,
} from 'react-native-track-player';
import { DeviceEventEmitter, NativeModules } from 'react-native';

import { NULL_TRACK } from '../objects/Song';
import { parseSongR128gain, resolveUrl } from '../utils/SongOperations';
import { initBiliHeartbeat } from '../utils/Bilibili/BiliOperate';
import { logger } from '../utils/Logger';
import noxPlayingList, { getNextSong } from '../stores/playingList';
import { NoxRepeatMode } from '../enums/RepeatMode';
import appStore, { resetResolvedURL, setCrossfaded } from '@stores/appStore';
import {
  fadePause,
  cycleThroughPlaymode,
  resolveAndCache,
  fadePlay,
} from '@utils/RNTPUtils';
import { performSkipToNext, performSkipToPrevious } from '@hooks/useTPControls';
import { useNoxSetting } from '@stores/useApp';
import { appStartupInit } from '@hooks/useSetupPlayer';
import { playFromMediaId, playFromSearch } from '@hooks/usePlayback.migrate';
import { isAndroid, isIOS } from '@utils/RNUtils';

const { APMWidgetModule } = NativeModules;
const { getState } = noxPlayingList;
const { setState } = appStore;
const getAppStoreState = appStore.getState;
const lastBiliHeartBeat: string[] = ['', ''];
const lastPlayedDuration: { val?: number } = { val: 0 };
let refetchThrottleGuard = 0;

export async function additionalPlaybackService({
  noInterruption = false,
  lastPlayDuration,
  currentPlayingID,
}: Partial<NoxStorage.PlayerSettingDict>) {
  if (isAndroid) {
    TrackPlayer.addEventListener(Event.RemotePlayId, e =>
      playFromMediaId(e.id),
    );
    TrackPlayer.addEventListener(Event.RemotePlaySearch, e =>
      playFromSearch(e.query.toLowerCase()),
    );
    TrackPlayer.addEventListener(Event.RemotePlayPause, async () => {
      if ((await TrackPlayer.getPlaybackState()).state === State.Playing) {
        fadePause();
      } else {
        TrackPlayer.play();
      }
    });
  }
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () =>
    performSkipToNext(true),
  );

  TrackPlayer.addEventListener(Event.RemoteNext, async () =>
    performSkipToNext(),
  );

  TrackPlayer.addEventListener(Event.RemotePrevious, async () =>
    performSkipToPrevious(),
  );

  TrackPlayer.addEventListener(Event.RemoteDuck, async event => {
    console.log('Event.RemoteDuck', event);
    if (noInterruption && event.paused) return;
    if (event.paused) return TrackPlayer.pause();
    if (event.permanent) return TrackPlayer.stop();
  });

  lastPlayedDuration.val = lastPlayDuration;
  TrackPlayer.addEventListener(Event.PlaybackState, async event => {
    APMWidgetModule?.updateWidget();
    if (event.state === State.Playing) fadePlay();
    if (lastPlayedDuration.val && event.state === State.Ready) {
      if ((await TrackPlayer.getActiveTrack())?.song?.id === currentPlayingID) {
        logger.debug(
          `[Playback] initalized last played duration to ${lastPlayDuration}`,
        );
        TrackPlayer.seekTo(lastPlayedDuration.val);
      }
      lastPlayedDuration.val = undefined;
    }
    if (event.state === State.Error) {
      const currTime = new Date().getTime();
      const track = await TrackPlayer.getActiveTrack();
      if (
        currTime - track?.urlRefreshTimeStamp > 3600000 &&
        track?.urlRefreshTimeStamp - refetchThrottleGuard > 10000
      ) {
        try {
          const currentProgress = await TrackPlayer.getProgress();
          logger.debug(`[ResolveURL] re-resolving track ${track?.title}`);
          const song = track?.song as NoxMedia.Song;
          const updatedMetadata = await resolveAndCache({ song });
          const currentTrack = await TrackPlayer.getActiveTrack();
          await TrackPlayer.load({
            ...currentTrack,
            ...updatedMetadata,
            urlRefreshTimeStamp: currTime,
          });
          await TrackPlayer.seekTo(currentProgress.position);
          TrackPlayer.play();
          refetchThrottleGuard = currTime;
        } catch (e) {
          console.error('resolveURL failed', track, e);
        }
      }
    }
  });
}

export async function PlaybackService() {
  DeviceEventEmitter.addListener(
    'APMVolume',
    (e: { volume: number }) =>
      e.volume === 0 &&
      useNoxSetting.getState().playerSetting.pausePlaybackOnMute &&
      TrackPlayer.pause(),
  );
  DeviceEventEmitter.addListener('APMEnterPIP', (e: boolean) =>
    setState({ pipMode: e }),
  );
  DeviceEventEmitter.addListener('APMNewIntent', (e: NoxComponent.AppProps) =>
    console.log('apm', e),
  );

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    fadePause();
  });

  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, event => {
    TrackPlayer.seekTo(event.position);
  });

  TrackPlayer.addEventListener(
    Event.PlaybackActiveTrackChanged,
    async event => {
      APMWidgetModule?.updateWidget();
      const playerErrored =
        (await TrackPlayer.getPlaybackState()).state === State.Error;
      await TrackPlayer.setVolume(0);
      if (event.track?.song === undefined) return;
      useNoxSetting.getState().setCurrentPlayingId(event.track.song.id);
      if (playerErrored) {
        resetResolvedURL(event.track.song, true);
      }
      setState({ activeTrackPlayingId: event.track.song.id });
      // prefetch song only when there is no next item in queue!
      if (
        (await TrackPlayer.getActiveTrackIndex()) ===
        (await TrackPlayer.getQueue()).length - 1
      ) {
        const playerSetting = useNoxSetting.getState().playerSetting;
        const nextSong = getNextSong(event.track.song);
        if (nextSong) {
          logger.debug(`[ResolveURL] prefetching ${nextSong.name}`);
          resolveAndCache({
            song: nextSong,
            dry: !(playerSetting.prefetchTrack && playerSetting.cacheSize > 2),
            resolver: ({ song }) =>
              resolveUrl({ song, prefetch: true, iOS: isIOS }),
          });
        }
      }
      // r128gain support:
      // this is here to load existing R128Gain values or resolve new gain values from cached files only.
      // another setR128Gain is in Cache.saveCacheMedia where the file is fetched, which is never a scenario here
      if (event.track.url !== NULL_TRACK.url) {
        const mAppState = getAppStoreState();
        if (mAppState.crossfaded) {
          // use crossfade fading instead
          setCrossfaded(false);
        } else {
          // this is when song is first played.
          const fadeIntervalMs = mAppState.fadeIntervalMs;
          logger.debug(`[FADEIN] fading in of ${fadeIntervalMs}...`);
          await parseSongR128gain(event.track.song, fadeIntervalMs, 0);
        }
      }
      const heartBeatReq = [event.track.song.bvid, event.track.song.id];
      // HACK: what if cid needs to be resolved on the fly?
      // TODO: its too much of a hassle and I would like to just
      // ask users to refresh their lists instead, if they really care
      // about sending heartbeats.
      if (
        lastBiliHeartBeat[0] !== heartBeatReq[0] ||
        lastBiliHeartBeat[1] !== heartBeatReq[1]
      ) {
        initBiliHeartbeat({
          bvid: event.track.song.bvid,
          cid: event.track.song.id,
        });
        lastBiliHeartBeat[0] = heartBeatReq[0];
        lastBiliHeartBeat[1] = heartBeatReq[1];
      }
      if (getState().playmode === NoxRepeatMode.RepeatTrack) {
        TrackPlayer.setRepeatMode(RepeatMode.Track);
      }
    },
  );

  if (isAndroid) {
    TrackPlayer.addEventListener(Event.RemoteCustomAction, async event => {
      if (event.customAction !== 'customPlaymode') return;
      cycleThroughPlaymode();
    });

    TrackPlayer.addEventListener(Event.PlaybackAnimatedVolumeChanged, e => {
      logger.debug(
        `animated volume finished event triggered: ${JSON.stringify(e)}`,
      );
      getAppStoreState().animatedVolumeChangedCallback();
      setState({ animatedVolumeChangedCallback: () => undefined });
    });
  }
  await appStartupInit;
  logger.debug('[APM] default playback service initialized and registered');
}
