import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ViewEnum } from '../../enums/View';
import { useNoxSetting } from '../../hooks/useSetting';
import RandomGIFButton from '../buttons/RandomGIF';

interface Props {
  navigation: DrawerNavigationProp<ParamListBase>;
}


const iconButtonContainerStyle = {
  alignContent: 'flex-start',
} as any;

const randomGifButtonContainerStyle = {
  flex: 4,
  alignContent: 'center',
  alignItems: 'center',
} as any;

const playlistIconButtonContainerStyle = {
  alignContent: 'flex-end',
} as any;

export default ({ navigation }: Props) => {
  const navigationGlobal = useNavigation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);

  const containerStyle = {
    ...playerStyle.playerTopBarContainer,
    alignItems: 'center',
  };


  return (
    <View style={[containerStyle]}>
      <View style={iconButtonContainerStyle}>
        <IconButton
          icon="menu"
          onPress={() => navigation.openDrawer()}
          size={40}
        />
      </View>

      <View style={randomGifButtonContainerStyle}>
        <RandomGIFButton
          gifs={playerStyle.gifs}
          favList={String(currentPlayingId)}
        />
      </View>
      <View style={playlistIconButtonContainerStyle}>
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
