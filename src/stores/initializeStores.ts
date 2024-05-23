import { NativeModules, Platform } from 'react-native';
import { useNoxSetting } from './useApp';
import { fetch } from '@react-native-community/netinfo';

import { initialize as initializeAppStore } from './appStore';
import { initializeR128Gain } from '../utils/ffmpeg/r128Store';
import { dataSaverPlaylist, initCache } from '../utils/Cache';

const { NoxAndroidAutoModule } = NativeModules;

const useInitializeStore = () => {
  const setGestureMode = useNoxSetting(state => state.setGestureMode);
  const initPlayer = useNoxSetting(state => state.initPlayer);
  const setCurrentPlayingList = useNoxSetting(
    state => state.setCurrentPlayingList
  );

  const initializeStores = async (val: NoxStorage.PlayerStorageObject) => {
    switch (Platform.OS) {
      case 'android':
        try {
          if (!(await NoxAndroidAutoModule.getLastExitReason())) {
            val.lastPlaylistId = ['DUMMY', 'DUMMY'];
          }
        } catch {
          // TODO: do something?
        }
        NoxAndroidAutoModule.isGestureNavigationMode().then(
          (gestureMode: boolean) => setGestureMode(gestureMode)
        );
        break;
      default:
        break;
    }
    await initializeAppStore();
    await initializeR128Gain();
    const results = await initPlayer(val);
    initCache({ max: results.storedPlayerSetting.cacheSize });
    if (
      (await fetch()).type === 'cellular' &&
      results.storedPlayerSetting.dataSaver
    ) {
      setCurrentPlayingList(dataSaverPlaylist(results.currentPlayingList));
    }
    return results;
  };
  return { initializeStores };
};
export default useInitializeStore;
