import React, { useEffect, useState } from 'react';
import TrackPlayer, { useActiveTrack } from 'react-native-track-player';
import {
  ActivityIndicator,
  Linking,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { TrackInfo } from './';
import { SetupService } from '../../services';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import PlayerTopInfo from './PlayerTopInfo';
import { useNoxSetting } from '../../hooks/useSetting';
import { songlistToTracklist } from '../../objects/Playlist';
import { initPlayerObject } from '../../utils/ChromeStorage';
import { getCurrentTPQueue } from '../../store/playingList';

interface props {
  navigation: DrawerNavigationProp<ParamListBase>;
}

export function Player({ navigation }: props) {
  const track = useActiveTrack();
  const navigationGlobal = useNavigation();
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

  useEffect(() => {
    let unmounted = false;
    (async () => {
      const { currentPlayingID } = await initPlayer(await initPlayerObject());
      await SetupService();
      if (unmounted) return;
      setPlayerReady(true);
      if (unmounted) return;
      const currentQueue = getCurrentTPQueue();
      const findCurrentSong = currentQueue.find(
        val => val.id === currentPlayingID
      );
      if (findCurrentSong) {
        await TrackPlayer.add(songlistToTracklist([findCurrentSong]));
      } else {
        await TrackPlayer.add(songlistToTracklist([currentQueue[0]]));
      }
      await TrackPlayer.pause();
    })();
    return () => {
      unmounted = true;
    };
  }, []);
  return playerReady;
}
