import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ViewEnum } from '../../enums/View';
import { useNoxSetting } from '../../hooks/useSetting';
import RandomGIFButton from '../buttons/RandomGIF';

interface Props {
  navigation: DrawerNavigationProp<ParamListBase>;
}

export default ({ navigation }: Props) => {
  const navigationGlobal = useNavigation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);

  return (
    <View style={[styles.containerStyle, playerStyle.playerTopBarContainer]}>
      <View style={styles.iconButtonContainerStyle}>
        <IconButton
          icon="menu"
          onPress={() => navigation.openDrawer()}
          size={40}
        />
      </View>

      <View style={styles.randomGifButtonContainerStyle}>
        <RandomGIFButton
          gifs={playerStyle.gifs}
          favList={String(currentPlayingId)}
        />
      </View>
      <View style={styles.playlistIconButtonContainerStyle}>
        <IconButton
          icon="playlist-music"
          onPress={() =>
            navigationGlobal.navigate(ViewEnum.PLAYER_PLAYLIST as never)
          }
          size={40}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  iconButtonContainerStyle: {
    alignContent: 'flex-start',
  },
  randomGifButtonContainerStyle: {
    flex: 4,
    alignContent: 'center',
    alignItems: 'center',
  },
  playlistIconButtonContainerStyle: {
    alignContent: 'flex-end',
  },
  containerStyle: {
    alignItems: 'center',
  },
});
