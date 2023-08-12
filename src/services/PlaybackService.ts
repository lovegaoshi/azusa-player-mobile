import TrackPlayer, {
  Event,
  State,
  RepeatMode,
} from 'react-native-track-player';
import { DeviceEventEmitter } from 'react-native';

import { resolveUrl, NULL_TRACK, parseSongR128gain } from '../objects/Song';
import { initBiliHeartbeat } from '../utils/Bilibili/BiliOperate';
import type { NoxStorage } from '../types/storage';
import { saveLastPlayDuration } from '../utils/ChromeStorage';
import logger from '../utils/Logger';
import NoxCache from '../utils/Cache';
import noxPlayingList, { getNextSong } from '../stores/playingList';
import appStore from '@stores/appStore';
import { NoxRepeatMode } from '../enums/RepeatMode';
import playerSettingStore from '@stores/playerSettingStore';

const { getState } = noxPlayingList;
const { setState } = appStore;
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
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.log('Event.RemotePlay');
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemoteJumpForward, async event => {
    console.log('Event.RemoteJumpForward', event);
    TrackPlayer.seekBy(event.interval);
  });

  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async event => {
    console.log('Event.RemoteJumpBackward', event);
    TrackPlayer.seekBy(-event.interval);
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
      TrackPlayer.setVolume(1);
      if (!event.track || !event.track.song) return;

      // prefetch song:
      const playerSetting = getPlayerSetting().playerSetting;
      if (playerSetting.prefetchTrack && playerSetting.cacheSize > 2) {
        const nextSong = getNextSong(event.track.song);
        if (nextSong) {
          logger.debug(`[ResolveURL] prefetching ${nextSong.name}`);
          resolveUrl(nextSong);
        }
      }

      // r128gain support:
      if (event.track.url !== NULL_TRACK.url) {
        await parseSongR128gain(event.track.song);
      }
      // to resolve bilibili media stream URLs on the fly, TrackPlayer.load is used to
      // replace the current track's url. its not documented? >:/
      if (
        event.index !== undefined &&
        (event.track.url === NULL_TRACK.url ||
          new Date().getTime() - event.track.urlRefreshTimeStamp > 3600000)
      ) {
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
        try {
          const updatedMetadata = await resolveUrl(event.track.song);
          NoxCache.noxMediaCache?.saveCacheMedia(
            event.track!.song,
            updatedMetadata
          );
          const currentTrack = await TrackPlayer.getActiveTrack();
          await TrackPlayer.load({ ...currentTrack, ...updatedMetadata });
          if (getState().playmode === NoxRepeatMode.REPEAT_TRACK) {
            TrackPlayer.setRepeatMode(RepeatMode.Track);
          }
        } catch (e) {
          console.error('resolveURL failed', event.track, e);
        }
      }
    }
  );

  TrackPlayer.addEventListener(Event.PlaybackPlayWhenReadyChanged, event => {
    console.log('Event.PlaybackPlayWhenReadyChanged', event);
  });

  TrackPlayer.addEventListener(Event.PlaybackState, event => {
    console.log('Event.PlaybackState', event);
  });

  TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, event => {
    saveLastPlayDuration(event.position);
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
}
