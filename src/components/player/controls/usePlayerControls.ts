import React from 'react';
import TrackPlayer, {
  useTrackPlayerEvents,
  Event,
  State,
  useActiveTrack,
} from 'react-native-track-player';

import { useNoxSetting } from '@stores/useApp';
import useTPControls from '@hooks/useTPControls';
import { saveLastPlayDuration } from '@utils/ChromeStorage';
import { logger } from '@utils/Logger';
import appStore, { getABRepeatRaw, setCurrentPlaying } from '@stores/appStore';
import noxPlayingList from '@stores/playingList';
import { NoxRepeatMode } from '@enums/RepeatMode';
import usePlaylistCRUD from '@hooks/usePlaylistCRUD';

const { getState } = noxPlayingList;
const { fadeIntervalMs, fadeIntervalSec } = appStore.getState();

export default () => {
  const { performSkipToNext, performSkipToPrevious, prepareSkipToNext } =
    useTPControls();
  const [abRepeat, setABRepeat] = React.useState<[number, number]>([0, 1]);
  const [bRepeatDuration, setBRepeatDuration] = React.useState(9999);
  const { updateCurrentSongMetadata, updateCurrentSongMetadataReceived } =
    usePlaylistCRUD();
  const track = useActiveTrack();
  const updateTrack = useNoxSetting(state => state.updateTrack);
  const crossfadeId = useNoxSetting(state => state.crossfadeId);
  const setCrossfadeId = useNoxSetting(state => state.setCrossfadeId);
  const crossfadeInterval = useNoxSetting(
    state => state.playerSetting,
  ).crossfade;
  const loadingTracker = React.useRef(false);

  useTrackPlayerEvents([Event.MetadataCommonReceived], async event => {
    console.log('Event.MetadataCommonReceived', event.metadata);
    if (
      !track?.song?.metadataOnReceived ||
      Object.keys(event.metadata).length === 0
    )
      return;
    const newMetadata: Partial<NoxMedia.Song> = { metadataOnReceived: false };
    if (event.metadata.artist) newMetadata.singer = event.metadata.artist;
    if (event.metadata.title) {
      newMetadata.name = event.metadata.title;
      newMetadata.parsedName = event.metadata.title;
    }
    if (event.metadata.albumTitle)
      newMetadata.album = event.metadata.albumTitle;
    // @ts-expect-error
    if (event.metadata.albumName)
      // @ts-expect-error
      newMetadata.album = event.metadata.albumName;
    if (event.metadata.artworkUri)
      newMetadata.cover = event.metadata.artworkUri;
    newMetadata.duration = (await TrackPlayer.getProgress()).duration;
    updateTrack(event.metadata);
    updateCurrentSongMetadataReceived({ metadata: newMetadata });
  });

  useTrackPlayerEvents([Event.PlaybackProgressUpdated], async event => {
    const playmode = getState().playmode;
    saveLastPlayDuration(event.position);
    // prepare for cross fading if enabled, playback is > 50% done and crossfade preparation isnt done
    if (
      crossfadeInterval > 0 &&
      event.position > event.duration * 0.5 &&
      crossfadeId !== (track?.song?.id ?? '')
    ) {
      logger.debug('[crossfade] preparing crossfade');
      await prepareSkipToNext();
      setCrossfadeId(track?.song?.id ?? '');
      return TrackPlayer.crossFadePrepare();
    }

    // if fade or crossfade should be triggered
    if (event.duration > 0 && playmode !== NoxRepeatMode.RepeatTrack) {
      const trueDuration = Math.min(bRepeatDuration, event.duration);
      if (
        crossfadeInterval > 0 &&
        trueDuration - event.position < crossfadeInterval &&
        crossfadeId === (track?.song?.id ?? '')
      ) {
        logger.debug('[crossfade] crossfading');
        return TrackPlayer.crossFade();
      }
      if (
        fadeIntervalSec > 0 &&
        event.position > trueDuration - fadeIntervalSec
      ) {
        logger.debug(
          `[FADEOUT] fading out....${event.position} / ${event.duration}`,
        );
        TrackPlayer.setAnimatedVolume({
          volume: 0,
          duration: fadeIntervalMs,
        });
      }
    }
    if (abRepeat[1] === 1) return;
    if (event.position > bRepeatDuration) {
      if (playmode === NoxRepeatMode.RepeatTrack) {
        TrackPlayer.seekTo(abRepeat[0] * event.duration);
        return;
      }
      performSkipToNext();
    }
  });

  useTrackPlayerEvents([Event.PlaybackState], async event => {
    console.log('Event.PlaybackState', event);
    switch (event.state) {
      case State.Loading:
        loadingTracker.current = true;
        break;
    }
    if (event.state !== State.Ready) return;
    updateCurrentSongMetadata();
    const song = (await TrackPlayer.getActiveTrack())?.song as NoxMedia.Song;
    const newABRepeat = getABRepeatRaw(song.id);
    setABRepeat(newABRepeat);
    if (setCurrentPlaying(song) && !loadingTracker.current) return;
    loadingTracker.current = false;
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
