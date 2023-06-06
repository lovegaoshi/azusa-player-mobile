import TrackPlayer, { Event } from 'react-native-track-player';
import { resolveUrl, NULL_TRACK } from '../objects/Song';
import { initBiliHeartbeat } from '../utils/Bilibili/BiliOperate';
import { NoxStorage } from '../types/storage';

let lastBiliHeartBeat: string[] = ['', ''];

export async function AdditionalPlaybackService({
  noInterruption = false,
}: Partial<NoxStorage.PlayerSettingDict>) {
  TrackPlayer.addEventListener(Event.RemoteDuck, async event => {
    console.log('Event.RemoteDuck', event);
    if (noInterruption && event.paused) return;
    if (event.paused) return TrackPlayer.pause();
    if (event.permanent) return TrackPlayer.stop();
  });
}

export async function PlaybackService() {
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

  TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, event => {
    console.log('Event.PlaybackActiveTrackChanged', event);
    if (!event.track || !event.track.song) return;
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
      resolveUrl(event.track.song)
        .then(updatedMetadata => {
          TrackPlayer.getActiveTrack().then(currentTrack => {
            TrackPlayer.load({ ...currentTrack, ...updatedMetadata });
          });
        })
        .catch(e => console.error('resolveURL failed', event.track, e));
    }
  });

  TrackPlayer.addEventListener(Event.PlaybackPlayWhenReadyChanged, event => {
    console.log('Event.PlaybackPlayWhenReadyChanged', event);
  });

  TrackPlayer.addEventListener(Event.PlaybackState, event => {
    console.log('Event.PlaybackState', event);
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
