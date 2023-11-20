import TrackPlayer, {
  Event,
  State,
  RepeatMode,
} from 'react-native-track-player';
import { DeviceEventEmitter, Platform } from 'react-native';

import { NULL_TRACK } from '../objects/Song';
import { parseSongR128gain } from '../utils/SongOperations';
import { initBiliHeartbeat } from '../utils/Bilibili/BiliOperate';
import type { NoxStorage } from '../types/storage';
import { logger } from '../utils/Logger';
import noxPlayingList, { getNextSong } from '../stores/playingList';
import { NoxRepeatMode } from '../enums/RepeatMode';
import playerSettingStore from '@stores/playerSettingStore';
import appStore, { resetResolvedURL } from '@stores/appStore';
import {
  fadePause,
  cycleThroughPlaymode,
  resolveAndCache,
} from '@utils/RNTPUtils';

const { getState } = noxPlayingList;
const { setState } = appStore;
const getAppStoreState = appStore.getState;
const getPlayerSetting = playerSettingStore.getState;
let lastBiliHeartBeat: string[] = ['', ''];

export async function AdditionalPlaybackService({
  noInterruption = false,
  lastPlayDuration,
}: Partial<NoxStorage.PlayerSettingDict>) {
  TrackPlayer.addEventListener(Event.RemoteDuck, async event => {
    console.log('Event.RemoteDuck', event);
    if (noInterruption && event.paused) return;
    if (event.paused) return TrackPlayer.pause();
    if (event.permanent) return TrackPlayer.stop();
  });

  const lastPlayedDuration = [lastPlayDuration];
  TrackPlayer.addEventListener(Event.PlaybackState, event => {
    if (lastPlayedDuration[0] && event.state === State.Ready) {
      logger.debug(
        `[Playback] initalized last played duration to ${lastPlayDuration}`
      );
      TrackPlayer.seekTo(lastPlayedDuration[0]);
      lastPlayedDuration[0] = null;
    }
  });
}

export async function PlaybackService() {
  DeviceEventEmitter.addListener('APMEnterPIP', (e: boolean) =>
    setState({ pipMode: e })
  );

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    console.log('Event.RemotePause');
    fadePause();
  });

  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    console.log('Event.RemotePlay');
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemoteJumpForward, async event => {
    console.log('Event.RemoteJumpForward', event);
    // TrackPlayer.seekBy(event.interval);
  });

  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async event => {
    console.log('Event.RemoteJumpBackward', event);
    cycleThroughPlaymode();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, event => {
    console.log('Event.RemoteSeek', event);
    TrackPlayer.seekTo(event.position);
  });

  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, event => {
    console.log('Event.PlaybackQueueEnded', event);
  });

  TrackPlayer.addEventListener(
    Event.PlaybackActiveTrackChanged,
    async event => {
      console.log('Event.PlaybackActiveTrackChanged', event);
      const playerErrored =
        (await TrackPlayer.getPlaybackState()).state === State.Error;
      await TrackPlayer.setVolume(0);
      if (!event.track || !event.track.song) return;
      if (playerErrored) {
        resetResolvedURL(event.track.song);
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
          resolveAndCache(
            nextSong,
            !(playerSetting.prefetchTrack && playerSetting.cacheSize > 2)
          );
        }
      }
      // r128gain support:
      // this is here to load existing R128Gain values or resolve new gain values from cached files only.
      // another setR128Gain is in Cache.saveCacheMedia where the file is fetched, which is never a scenario here
      if (event.track.url !== NULL_TRACK.url) {
        // this is when song is first played.
        logger.debug('[FADEIN] fading in...');
        await parseSongR128gain(
          event.track.song,
          getAppStoreState().fadeIntervalMs,
          0
        );
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
          const updatedMetadata = await resolveAndCache(song);
          const currentTrack = await TrackPlayer.getActiveTrack();
          await TrackPlayer.load({ ...currentTrack, ...updatedMetadata });
          if (playerErrored) {
            TrackPlayer.play();
          }
        } catch (e) {
          console.error('resolveURL failed', event.track, e);
        }
      }
      if (getState().playmode === NoxRepeatMode.REPEAT_TRACK) {
        TrackPlayer.setRepeatMode(RepeatMode.Track);
      }
    }
  );

  TrackPlayer.addEventListener(Event.PlaybackPlayWhenReadyChanged, event => {
    console.log('Event.PlaybackPlayWhenReadyChanged', event);
  });

  if (Platform.OS === 'android') {
    TrackPlayer.addEventListener(Event.PlaybackAnimatedVolumeChanged, () => {
      logger.debug('animated volume finished event triggered');
      getAppStoreState().animatedVolumeChangedCallback();
      setState({ animatedVolumeChangedCallback: () => undefined });
    });
  }
}
