import { useEffect, useState } from 'react';
import TrackPlayer from 'react-native-track-player';
import { NativeModules, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SetupService, AdditionalPlaybackService } from 'services';
import { initPlayerObject } from '@utils/ChromeStorage';
import { initCache } from '@utils/Cache';
import { getCurrentTPQueue, initializePlaybackMode } from '@stores/playingList';
import useVersionCheck from '@hooks/useVersionCheck';
import { songlistToTracklist } from '@utils/RNTPUtils';
import useInitializeStore from '@stores/initializeStores';
import { useNoxSetting } from '@stores/useApp';

const { NoxAndroidAutoModule } = NativeModules;

export default ({ intentData }: NoxComponent.AppProps) => {
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const { initializeStores } = useInitializeStore();
  const { updateVersion, checkVersion } = useVersionCheck();
  const setIntentData = useNoxSetting(state => state.setIntentData);
  const { i18n } = useTranslation();

  useEffect(() => {
    let unmounted = false;
    (async () => {
      const {
        currentPlayingID,
        storedPlayerSetting,
        language,
        lastPlayDuration,
        playbackMode,
      } = await initializeStores(await initPlayerObject());
      initCache({ max: storedPlayerSetting.cacheSize });
      /**
       * this doesnt even seems necessary?
      for (const [key, value] of Object.entries(cookies)) {
        CookieManager.setFromResponse(key, value);
      } */
      i18n.changeLanguage(language);
      const serviceOptions = {
        noInterruption: storedPlayerSetting.noInterruption,
        keepForeground: storedPlayerSetting.keepForeground,
        lastPlayDuration,
      };
      await SetupService(serviceOptions);
      initializePlaybackMode(playbackMode);
      updateVersion(storedPlayerSetting);
      checkVersion(true, storedPlayerSetting);
      if (unmounted) return;
      setPlayerReady(true);
      if (unmounted) return;
      const currentQueue = getCurrentTPQueue();
      const findCurrentSong = currentQueue.find(
        val => val.id === currentPlayingID
      );
      if (findCurrentSong) {
        await TrackPlayer.add(await songlistToTracklist([findCurrentSong]));
      } else {
        currentQueue[0] &&
          (await TrackPlayer.add(await songlistToTracklist([currentQueue[0]])));
        serviceOptions.lastPlayDuration = 0;
      }
      await AdditionalPlaybackService(serviceOptions);
      setIntentData(intentData);
      switch (intentData) {
        case NoxEnumIntent.IntentData.Resume:
          await TrackPlayer.play();
          break;
        case NoxEnumIntent.IntentData.PlayAll:
        // this hook cannot use usePlayback bc of rerendering.
        default:
          await TrackPlayer.pause();
      }
      if (Platform.OS === 'android') {
        NoxAndroidAutoModule.disableShowWhenLocked();
      }
    })();
    return () => {
      unmounted = true;
    };
  }, []);
  return playerReady;
};
