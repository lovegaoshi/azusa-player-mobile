import { NativeModules, Platform } from 'react-native';
import { useNoxSetting } from './useApp';
import { fetch } from '@react-native-community/netinfo';
import i18next from 'i18next';

import { initialize as initializeAppStore } from './appStore';
import { initializeR128Gain } from '../utils/ffmpeg/r128Store';
import { dataSaverPlaylist, initCache } from '../utils/Cache';

const { NoxModule } = NativeModules;

interface InitializeStores {
  val: NoxStorage.PlayerStorageObject;
  setGestureMode?: (val: boolean) => void;
  initPlayer?: (
    val: NoxStorage.PlayerStorageObject
  ) => Promise<NoxStorage.initializedResults>;
  setCurrentPlayingList?: (val: NoxMedia.Playlist) => boolean;
}
export const initializeStores = async ({
  val,
  setGestureMode = useNoxSetting.getState().setGestureMode,
  initPlayer = useNoxSetting.getState().initPlayer,
  setCurrentPlayingList = useNoxSetting.getState().setCurrentPlayingList,
}: InitializeStores) => {
  switch (Platform.OS) {
    case 'android':
      try {
        if (!(await NoxModule.getLastExitReason())) {
          val.lastPlaylistId = ['DUMMY', 'DUMMY'];
        }
      } catch {
        // TODO: do something?
      }
      NoxModule.isGestureNavigationMode().then((gestureMode: boolean) =>
        setGestureMode(gestureMode)
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
  i18next.changeLanguage(results.language);
  return results;
};

const useInitializeStore = () => {
  const setGestureMode = useNoxSetting(state => state.setGestureMode);
  const initPlayer = useNoxSetting(state => state.initPlayer);
  const setCurrentPlayingList = useNoxSetting(
    state => state.setCurrentPlayingList
  );

  return {
    initializeStores: (val: NoxStorage.PlayerStorageObject) =>
      initializeStores({
        val,
        setGestureMode,
        initPlayer,
        setCurrentPlayingList,
      }),
  };
};
export default useInitializeStore;
