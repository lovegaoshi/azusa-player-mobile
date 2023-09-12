import React, { useEffect, useState } from 'react';
import TrackPlayer, { useActiveTrack } from 'react-native-track-player';
import {
  SafeAreaView,
  StatusBar,
  View,
  NativeModules,
  Platform,
} from 'react-native';
import { ParamListBase } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';

import { TrackInfo } from './';
import { SetupService, AdditionalPlaybackService } from 'services';
import PlayerTopInfo from './PlayerTopInfo';
import { useNoxSetting } from '@hooks/useSetting';
import { initPlayerObject } from '@utils/ChromeStorage';
import { initCache } from '@utils/Cache';
import { getCurrentTPQueue } from '@stores/playingList';
import useVersionCheck from '@hooks/useVersionCheck';
import { songlistToTracklist } from '@utils/RNTPUtils';

const { NoxAndroidAutoModule } = NativeModules;

interface Props {
  navigation: DrawerNavigationProp<ParamListBase>;
}

export function Player({ navigation }: Props) {
  const track = useActiveTrack();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  // TODO: component

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
  const initPlayer = useNoxSetting(state => state.initPlayer);
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
      } = await initPlayer(await initPlayerObject());
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
        await TrackPlayer.add(await songlistToTracklist([currentQueue[0]]));
        serviceOptions.lastPlayDuration = 0;
      }
      await AdditionalPlaybackService(serviceOptions);
      await TrackPlayer.pause();
      if (Platform.OS === 'android') {
        NoxAndroidAutoModule.disableShowWhenLocked();
      }
    })();
    return () => {
      unmounted = true;
    };
  }, []);
  return playerReady;
}
