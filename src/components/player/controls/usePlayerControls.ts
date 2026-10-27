import React from 'react';
import TrackPlayer, {
  useTrackPlayerEvents,
  Event,
  State,
} from 'react-native-track-player';

import { useNoxSetting } from '@stores/useApp';
import useTPControls from '@hooks/useTPControls';
import noxPlayingList from '@stores/playingList';
import { NoxRepeatMode } from '@enums/RepeatMode';
import usePlaylistCRUD from '@hooks/usePlaylistCRUD';
import { getABRepeatNormalized } from '@utils/db/sqlAPI';
import { useTrackStore } from '@hooks/useActiveTrack';
import useSponsorBlock from './useSponsorBlock';
import { TPSeek } from '@stores/RNObserverStore';
import {
  onAPMPlaybackActiveTrackChanged,
  onAPMProgress,
} from '@services/APMPlayback';

const { getState } = noxPlayingList;

export default function usePlayerControls() {
  const { performSkipToNext, performSkipToPrevious, prepareSkipToNext } =
    useTPControls();

  const resumePlayback = useNoxSetting(state => state.resumePlayback);
  const skipARepeat = useNoxSetting(state => state.skipARepeat);
  const setSkipARepeat = useNoxSetting(state => state.setSkipARepeat);
  const abRepeat = useNoxSetting(state => state.abRepeat);
  const setABRepeat = useNoxSetting(state => state.setABRepeat);
  const bRepeatDuration = useNoxSetting(state => state.bRepeatDuration);
  const setBRepeatDuration = useNoxSetting(state => state.setBRepeatDuration);
  const crossfadingId = useNoxSetting(state => state.crossfadingId);
  const setCrossfadingId = useNoxSetting(state => state.setCrossfadingId);
  const setHookLoaded = useNoxSetting(state => state.setHookLoaded);
  setHookLoaded(true);

  const { updateCurrentSongMetadata, updateCurrentSongMetadataReceived } =
    usePlaylistCRUD();
  const track = useTrackStore(state => state.track);
  const updateTrack = useTrackStore(state => state.updateTrack);
  const crossfadeId = useNoxSetting(state => state.crossfadeId);
  const setCrossfadeId = useNoxSetting(state => state.setCrossfadeId);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const loadingTracker = React.useRef(false);
  const { initSponsorBlock, checkSponsorBlock } = useSponsorBlock();

  useTrackPlayerEvents([Event.MetadataCommonReceived], async event => {
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
    const { playmode, playingList } = getState();
    const currentSongId = track?.song?.id ?? '';
    return onAPMProgress({
      event,
      sbSkip: checkSponsorBlock(event.position, currentSongId),
      playmode,
      playingList,
      track,
      resumePlayback,
      playerSetting,
      crossfadeId,
      setCrossfadeId,
      setBRepeatDuration,
      abRepeat,
      setSkipARepeat,
      bRepeatDuration,
      crossfadingId,
      setCrossfadingId,
      prepareSkipToNext,
      performSkipToNext,
    });
  });

  useTrackPlayerEvents([Event.PlaybackState], async event => {
    switch (event.state) {
      case State.Loading:
        loadingTracker.current = true;
        break;
    }
    if (event.state !== State.Ready) return;
    updateCurrentSongMetadata().then(v => {
      if (v) {
        updateTrack({
          ...v,
          artwork: v.cover,
          title: v.name,
          artist: v.singer,
        });
      }
    });
    const { playmode, currentPlayingId } = getState();
    if (!loadingTracker.current || playmode !== NoxRepeatMode.RepeatTrack) {
      return;
    }
    const newABRepeat = await getABRepeatNormalized(currentPlayingId);
    if (newABRepeat.a === 0) return;
    loadingTracker.current = false;
    if (skipARepeat) {
      setSkipARepeat(false);
    } else {
      const trackDuration = (await TrackPlayer.getProgress()).duration;
      TPSeek(
        resumePlayback && newABRepeat.resumePlayback !== -1
          ? newABRepeat.resumePlayback
          : trackDuration * newABRepeat.a,
      );
    }
  });

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async event => {
    onAPMPlaybackActiveTrackChanged({
      event,
      initSponsorBlock,
      setABRepeat,
      loadingTracker,
      resumePlayback,
      setBRepeatDuration,
    });
  });

  return {
    performSkipToNext,
    performSkipToPrevious,
  };
}
