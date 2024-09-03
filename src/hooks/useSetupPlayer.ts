import { useEffect, useState } from 'react';
import TrackPlayer from 'react-native-track-player';
import { NativeModules, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SetupService, AdditionalPlaybackService } from 'services';
import { initPlayerObject } from '@utils/ChromeStorage';
import { getCurrentTPQueue, initializePlaybackMode } from '@stores/playingList';
import useVersionCheck from '@hooks/useVersionCheck';
import { songlistToTracklist } from '@utils/RNTPUtils';
import useInitializeStore from '@stores/initializeStores';
import { IntentData } from '@enums/Intent';
import { useNoxSetting } from '@stores/useApp';
import usePlayStore from './usePlayStore';

const { NoxAndroidAutoModule } = NativeModules;

export default ({ intentData }: NoxComponent.AppProps) => {
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const { initializeStores } = useInitializeStore();
  const { updateVersion, checkVersion } = useVersionCheck();
  const setIntentData = useNoxSetting(state => state.setIntentData);
  const { i18n } = useTranslation();
  const { checkPlayStoreUpdates } = usePlayStore();

  useEffect(() => {
    let unmounted = false;
    (async () => {
      const {
        currentPlayingID,
        storedPlayerSetting,
        language,
        lastPlayDuration,
        playbackMode,
      } = await initializeStores(
        await initPlayerObject(intentData === IntentData.SafeMode)
      );
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
        currentPlayingID,
      };
      await SetupService(serviceOptions);
      initializePlaybackMode(playbackMode);
      updateVersion(storedPlayerSetting);
      checkVersion(true, storedPlayerSetting);
      if (unmounted) return;
      setPlayerReady(true);
      if (unmounted) return;
      checkPlayStoreUpdates();
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
        case IntentData.Resume:
          await TrackPlayer.play();
          break;
        case IntentData.PlayAll:
          // this hook cannot use usePlayback bc of rerendering..??
          break;
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
