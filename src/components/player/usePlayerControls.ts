import { useTrackPlayerEvents, Event } from 'react-native-track-player';

import { useNoxSetting } from '@hooks/useSetting';
import useTPControls from '@hooks/useTPControls';

export default () => {
  const { performSkipToNext, performSkipToPrevious } = useTPControls();
  const setCurrentPlayingId = useNoxSetting(state => state.setCurrentPlayingId);

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

  return {
    performSkipToNext,
    performSkipToPrevious,
  };
};
