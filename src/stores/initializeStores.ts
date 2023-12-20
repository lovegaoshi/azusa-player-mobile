import { NativeModules, Platform } from 'react-native';
import { useNoxSetting } from './useApp';

import { initialize as initializeAppStore } from './appStore';
import { initializeR128Gain } from '../utils/ffmpeg/r128Store';

const { NoxAndroidAutoModule } = NativeModules;

const useInitializeStore = () => {
  const setGestureMode = useNoxSetting(state => state.setGestureMode);
  const initPlayer = useNoxSetting(state => state.initPlayer);

  const initializeStores = async (val: NoxStorage.PlayerStorageObject) => {
    switch (Platform.OS) {
      case 'android':
        NoxAndroidAutoModule.isGestureNavigationMode().then(
          (gestureMode: boolean) => setGestureMode(gestureMode)
        );
        break;
      default:
        break;
    }
    await initializeAppStore();
    await initializeR128Gain();
    return await initPlayer(val);
  };
  return { initializeStores };
};
export default useInitializeStore;
