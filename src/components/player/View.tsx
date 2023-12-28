import React, { useEffect, useState } from 'react';
import TrackPlayer from 'react-native-track-player';
import {
  SafeAreaView,
  StatusBar,
  View,
  NativeModules,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import TrackInfo from './TrackInfo/TrackInfo';
import { SetupService, AdditionalPlaybackService } from 'services';
import PlayerTopInfo from './PlayerTopInfo';
import { useNoxSetting } from '@stores/useApp';
import { initPlayerObject } from '@utils/ChromeStorage';
import { initCache } from '@utils/Cache';
import { getCurrentTPQueue, initializePlaybackMode } from '@stores/playingList';
import useVersionCheck from '@hooks/useVersionCheck';
import { songlistToTracklist } from '@utils/RNTPUtils';
import useActiveTrack from '@hooks/useActiveTrack';
import useInitializeStore from '@stores/initializeStores';

const { NoxAndroidAutoModule } = NativeModules;

export function Player({ navigation }: NoxComponent.NavigationProps) {
  const { track, updateTrack } = useActiveTrack();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const setUpdateTrack = useNoxSetting(state => state.setUpdateTrack);

  useEffect(() => setUpdateTrack(updateTrack), []);

  return (
    <SafeAreaView style={playerStyle.screenContainer}>
      <StatusBar barStyle={'light-content'} />
      <View style={playerStyle.contentContainer}>
        <PlayerTopInfo navigation={navigation}></PlayerTopInfo>
        <TrackInfo track={track} />
      </View>
    </SafeAreaView>
  );
}

export function useSetupPlayer() {
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const { initializeStores } = useInitializeStore();
  const { updateVersion, checkVersion } = useVersionCheck();
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
        lastPlayDuration,
      };
      await SetupService(serviceOptions);
      initializePlaybackMode(playbackMode);
      updateVersion(storedPlayerSetting);
      checkVersion(true, storedPlayerSetting);
      if (unmounted) return;
      if (Platform.OS === 'android') {
        NoxAndroidAutoModule.disableShowWhenLocked();
      }
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
      await TrackPlayer.pause();
    })();
    return () => {
      unmounted = true;
    };
  }, []);
  return playerReady;
}
