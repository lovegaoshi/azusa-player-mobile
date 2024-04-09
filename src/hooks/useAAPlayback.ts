import { Platform } from 'react-native';
import { useEffect } from 'react';
import TrackPlayer, { Event } from 'react-native-track-player';
import usePlayback from './usePlayback';
import { useNoxSetting } from '@stores/useApp';
import { IntentData } from '@enums/Intent';

const useAAPlayback = () => {
  const { buildBrowseTree, playFromMediaId, playFromSearch, shuffleAll } =
    usePlayback();
  const intentData = useNoxSetting(state => state.intentData);
  const setIntentData = useNoxSetting(state => state.setIntentData);

  useEffect(() => {
    if (Platform.OS !== 'android') return () => null;
    const listener = TrackPlayer.addEventListener(Event.RemotePlayId, e =>
      playFromMediaId(e.id)
    );
    const listener2 = TrackPlayer.addEventListener(Event.RemotePlaySearch, e =>
      playFromSearch(e.query.toLowerCase())
    );
    const listener3 = TrackPlayer.addEventListener(Event.RemoteSkip, event => {
      console.log('Event.RemoteSkip', event);
      TrackPlayer.skip(event.index).then(() => TrackPlayer.play());
    });

    // HACK: for some reason I decided to register AA related listeners here.
    // I need the intent shuffleall handling somewhere it only runs once, which
    // is here... but this looks BAD.
    if (intentData === IntentData.PlayAll) {
      shuffleAll();
      setIntentData();
    }

    return () => {
      listener.remove();
      listener2.remove();
      listener3.remove();
    };
  }, []);

  // HACK: this looks very stupid but AAPlaybackListener needs buildBrowseTree, PlayFromMediaID, etc.
  // so might as well pass this off from AAPlaybackListener to register the listeners and use buildBrowseTree
  // two birds in one stone.
  return { buildBrowseTree };
};

export default useAAPlayback;
