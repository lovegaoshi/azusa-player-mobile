import TrackPlayer, {
  Event,
  State,
  RepeatMode,
} from 'react-native-track-player';
import { DeviceEventEmitter, Platform } from 'react-native';

import { NULL_TRACK, parseSongR128gain } from '../objects/Song';
import { initBiliHeartbeat } from '../utils/Bilibili/BiliOperate';
import type { NoxStorage } from '../types/storage';
import { saveLastPlayDuration } from '../utils/ChromeStorage';
import { logger } from '../utils/Logger';
import noxPlayingList, { getNextSong } from '../stores/playingList';
import { NoxRepeatMode } from '../enums/RepeatMode';
import playerSettingStore from '@stores/playerSettingStore';
import appStore, {
  getABRepeatRaw,
  resetResolvedURL,
  setCurrentPlaying,
} from '@stores/appStore';
import {
  fadePause,
  fadePlay,
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
  let abRepeat = [0, 1];
  let bRepeatDuration = 9999;

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

  TrackPlayer.addEventListener(Event.PlaybackState, async event => {
    console.log('Event.PlaybackState', event);
    if (event.state === State.Playing) {
      fadePlay();
    }
    // AB repeat implementation
    // HACK: this works and feels terrible but I can't figure out something better.
    if (event.state !== State.Ready) return;
    const song = (await TrackPlayer.getActiveTrack())?.song as NoxMedia.Song;
    abRepeat = getABRepeatRaw(song.id);
    if (setCurrentPlaying(song)) return;
    const trackDuration = (await TrackPlayer.getProgress()).duration;
    bRepeatDuration = abRepeat[1] * trackDuration;
    if (abRepeat[0] === 0) return;
    TrackPlayer.seekTo(trackDuration * abRepeat[0]);
  });

  TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, event => {
    saveLastPlayDuration(event.position);
    const { fadeIntervalMs, fadeIntervalSec } = getAppStoreState();
    if (
      event.duration > 0 &&
      event.position >
        Math.min(bRepeatDuration, event.duration) - fadeIntervalSec
    ) {
      if (getState().playmode !== NoxRepeatMode.REPEAT_TRACK) {
        logger.debug(
          `[FADEOUT] fading out....${event.position} / ${event.duration}`
        );
        TrackPlayer.setAnimatedVolume({
          volume: 0,
          duration: fadeIntervalMs,
        });
      }
    }
    if (abRepeat[1] === 1) return;
    if (event.position > bRepeatDuration) {
      // TODO: move this to usePlayerControl and use performSkipToNext
      TrackPlayer.seekTo(event.duration);
    }
  });

  TrackPlayer.addEventListener(
    Event.PlaybackMetadataReceived,
    async ({ title, artist }) => {
      const activeTrack = await TrackPlayer.getActiveTrack();
      TrackPlayer.updateNowPlayingMetadata({
        artist: [title, artist].filter(Boolean).join(' - '),
        title: activeTrack?.title,
        artwork: activeTrack?.artwork,
      });
    }
  );
  if (Platform.OS === 'android') {
    TrackPlayer.addEventListener(Event.PlaybackAnimatedVolumeChanged, () => {
      logger.debug('animated volume finished event triggered');
      getAppStoreState().animatedVolumeChangedCallback();
      setState({ animatedVolumeChangedCallback: () => undefined });
    });
  }
}
