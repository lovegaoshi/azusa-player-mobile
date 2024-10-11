import TrackPlayer, {
  Event,
  State,
  RepeatMode,
} from 'react-native-track-player';
import { DeviceEventEmitter, Platform, NativeModules } from 'react-native';

import { NULL_TRACK } from '../objects/Song';
import { parseSongR128gain, resolveUrl } from '../utils/SongOperations';
import { initBiliHeartbeat } from '../utils/Bilibili/BiliOperate';
import { logger } from '../utils/Logger';
import noxPlayingList, { getNextSong } from '../stores/playingList';
import { NoxRepeatMode } from '../enums/RepeatMode';
import playerSettingStore from '@stores/playerSettingStore';
import appStore, { resetResolvedURL } from '@stores/appStore';
import {
  fadePause,
  cycleThroughPlaymode,
  resolveAndCache,
  isIOS,
  fadePlay,
} from '@utils/RNTPUtils';
import { performSkipToNext, performSkipToPrevious } from '@hooks/useTPControls';
import { useNoxSetting } from '@stores/useApp';
import { appStartupInit } from '@hooks/useSetupPlayer';

const { APMWidgetModule } = NativeModules;
const { getState } = noxPlayingList;
const { setState } = appStore;
const getAppStoreState = appStore.getState;
const getPlayerSetting = playerSettingStore.getState;
let lastBiliHeartBeat: string[] = ['', ''];
const lastPlayedDuration: { val?: number } = { val: 0 };

export async function additionalPlaybackService({
  noInterruption = false,
  lastPlayDuration,
  currentPlayingID,
}: Partial<NoxStorage.PlayerSettingDict>) {
  TrackPlayer.addEventListener(Event.RemotePlayPause, async () => {
    if ((await TrackPlayer.getPlaybackState()).state === State.Playing) {
      fadePause();
    } else {
      TrackPlayer.play();
    }
  });

  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () =>
    performSkipToNext(true)
  );

  TrackPlayer.addEventListener(Event.RemoteNext, async () =>
    performSkipToNext()
  );

  TrackPlayer.addEventListener(Event.RemotePrevious, async () =>
    performSkipToPrevious()
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
          `[Playback] initalized last played duration to ${lastPlayDuration}`
        );
        TrackPlayer.seekTo(lastPlayedDuration.val);
      }
      lastPlayedDuration.val = undefined;
    }
  });
}

export async function PlaybackService() {
  DeviceEventEmitter.addListener('APMEnterPIP', (e: boolean) =>
    setState({ pipMode: e })
  );
  DeviceEventEmitter.addListener('APMNewIntent', (e: NoxComponent.AppProps) =>
    console.log('apm', e)
  );

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    console.log('Event.RemotePause');
    fadePause();
  });

  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    console.log('Event.RemotePlay');
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemoteCustomAction, async event => {
    console.log('Event.RemoteCustomPlaymode', event);
    if (event.customAction !== 'customPlaymode') return;
    cycleThroughPlaymode();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, event => {
    console.log('Event.RemoteSeek', event);
    TrackPlayer.seekTo(event.position);
  });

  TrackPlayer.addEventListener(
    Event.PlaybackActiveTrackChanged,
    async event => {
      console.log('Event.PlaybackActiveTrackChanged', event);
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
        const playerSetting = getPlayerSetting().playerSetting;
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
        // this is when song is first played.
        const fadeIntervalMs = getAppStoreState().fadeIntervalMs;
        logger.debug(`[FADEIN] fading in of ${fadeIntervalMs}...`);
        await parseSongR128gain(event.track.song, fadeIntervalMs, 0);
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
        lastBiliHeartBeat = heartBeatReq;
      }
      // to resolve bilibili media stream URLs on the fly, TrackPlayer.load is used to
      // replace the current track's url. its not documented? >:/
      if (
        event.index !== undefined &&
        new Date().getTime() - event.track.urlRefreshTimeStamp > 3600000
      ) {
        try {
          const song = event.track.song as NoxMedia.Song;
          const updatedMetadata = await resolveAndCache({ song });
          const currentTrack = await TrackPlayer.getActiveTrack();
          await TrackPlayer.load({ ...currentTrack, ...updatedMetadata });
          if (playerErrored) {
            TrackPlayer.play();
          }
        } catch (e) {
          console.error('resolveURL failed', event.track, e);
        }
      }
      if (getState().playmode === NoxRepeatMode.RepeatTrack) {
        TrackPlayer.setRepeatMode(RepeatMode.Track);
      }
    }
  );

  TrackPlayer.addEventListener(Event.PlaybackPlayWhenReadyChanged, event => {
    console.log('Event.PlaybackPlayWhenReadyChanged', event);
  });

  if (Platform.OS === 'android') {
    TrackPlayer.addEventListener(Event.PlaybackAnimatedVolumeChanged, e => {
      logger.debug(
        `animated volume finished event triggered: ${JSON.stringify(e)}`
      );
      getAppStoreState().animatedVolumeChangedCallback();
      setState({ animatedVolumeChangedCallback: () => undefined });
    });
  }
  await appStartupInit;
  logger.debug('[APM] default playback service initialized and registered');
}
