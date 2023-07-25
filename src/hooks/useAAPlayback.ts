import { EmitterSubscription, Platform } from 'react-native';
import { useEffect } from 'react';
import TrackPlayer, { Event } from 'react-native-track-player';
import usePlayback from './usePlayback';

const useAAPlayback = () => {
  const { buildBrowseTree, playFromMediaId, playFromSearch } = usePlayback();

  useEffect(() => {
    let listener: EmitterSubscription | undefined;
    let listener2: EmitterSubscription | undefined;
    let listener3: EmitterSubscription | undefined;
    if (Platform.OS === 'android') {
      listener = TrackPlayer.addEventListener(Event.RemotePlayId, e =>
        playFromMediaId(e.id)
      );
      listener2 = TrackPlayer.addEventListener(Event.RemotePlaySearch, e =>
        playFromSearch(e.query.toLowerCase())
      );
      listener3 = TrackPlayer.addEventListener(Event.RemoteSkip, event => {
        console.log('Event.RemoteSkip', event);
        TrackPlayer.skip(event.index).then(() => TrackPlayer.play());
      });
    }

    return () => {
      listener?.remove();
      listener2?.remove();
      listener3?.remove();
    };
  }, []);

  return { buildBrowseTree };
};

export default useAAPlayback;
