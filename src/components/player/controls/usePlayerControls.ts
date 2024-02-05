import React from 'react';
import TrackPlayer, {
  useTrackPlayerEvents,
  Event,
  State,
} from 'react-native-track-player';

import { useNoxSetting } from '@stores/useApp';
import useTPControls from '@hooks/useTPControls';
import { saveLastPlayDuration } from '@utils/ChromeStorage';
import { logger } from '@utils/Logger';
import appStore, { getABRepeatRaw, setCurrentPlaying } from '@stores/appStore';
import noxPlayingList from '@stores/playingList';
import { NoxRepeatMode } from '@enums/RepeatMode';
import { fadePlay } from '@utils/RNTPUtils';
import usePlaylistCRUD from '@hooks/usePlaylistCRUD';

const { getState } = noxPlayingList;
const { fadeIntervalMs, fadeIntervalSec } = appStore.getState();

export default () => {
  const { performSkipToNext, performSkipToPrevious } = useTPControls();
  const [abRepeat, setABRepeat] = React.useState<[number, number]>([0, 1]);
  const [bRepeatDuration, setBRepeatDuration] = React.useState(9999);
  const setCurrentPlayingId = useNoxSetting(state => state.setCurrentPlayingId);
  const { updateCurrentSongMetadata } = usePlaylistCRUD();

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], event => {
    if (event.track && event.track.song) {
      setCurrentPlayingId(event.track.song.id);
    }
  });

  useTrackPlayerEvents([Event.PlaybackQueueEnded], () => {
    performSkipToNext();
  });

  useTrackPlayerEvents([Event.RemoteNext], () => {
    performSkipToNext();
  });

  useTrackPlayerEvents([Event.RemotePrevious], () => {
    performSkipToPrevious();
  });

  useTrackPlayerEvents([Event.PlaybackProgressUpdated], event => {
    saveLastPlayDuration(event.position);
    if (
      fadeIntervalSec > 0 &&
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
      if (getState().playmode === NoxRepeatMode.REPEAT_TRACK) {
        TrackPlayer.seekTo(abRepeat[0] * event.duration);
        return;
      }
      performSkipToNext();
    }
  });

  useTrackPlayerEvents([Event.PlaybackState], async event => {
    console.log('Event.PlaybackState', event);
    if (event.state === State.Playing) {
      fadePlay();
    }
    if (event.state !== State.Ready) return;
    updateCurrentSongMetadata();
    const song = (await TrackPlayer.getActiveTrack())?.song as NoxMedia.Song;
    const newABRepeat = getABRepeatRaw(song.id);
    setABRepeat(newABRepeat);
    if (setCurrentPlaying(song)) return;
    const trackDuration = (await TrackPlayer.getProgress()).duration;
    setBRepeatDuration(newABRepeat[1] * trackDuration);
    if (newABRepeat[0] === 0) return;
    TrackPlayer.seekTo(trackDuration * newABRepeat[0]);
  });

  return {
    performSkipToNext,
    performSkipToPrevious,
  };
};
