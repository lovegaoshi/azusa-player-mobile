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
import { QueueInitialTracksService, SetupService } from '../../services';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import PlayerTopInfo from './PlayerTopInfo';
import { useNoxSetting } from '../../hooks/useSetting';
import { songlistToTracklist } from '../../objects/Playlist';

export function Player({
  navigation,
}: {
  navigation: DrawerNavigationProp<ParamListBase>;
}) {
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
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);

  useEffect(() => {
    let unmounted = false;
    (async () => {
      await SetupService();
      if (unmounted) return;
      setPlayerReady(true);
      const queue = await TrackPlayer.getQueue();
      if (unmounted) return;
      await TrackPlayer.setQueue(
        songlistToTracklist(currentPlayingList.songList)
      );
      if (queue.length <= 0) {
        await QueueInitialTracksService();
      }
    })();
    return () => {
      unmounted = true;
    };
  }, []);
  return playerReady;
}
