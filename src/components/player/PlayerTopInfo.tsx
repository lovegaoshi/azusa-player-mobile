import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ViewEnum } from '../../enums/View';
import { useNoxSetting } from '../../hooks/useSetting';
import RandomGIFButton from '../buttons/RandomGIF';

interface props {
  navigation: DrawerNavigationProp<ParamListBase>;
}

export default ({ navigation }: props) => {
  const navigationGlobal = useNavigation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  // <Text>{''}</Text>
  return (
    <View style={[playerStyle.playerTopBarContainer, { alignItems: 'center' }]}>
      <View style={{ alignContent: 'flex-start' }}>
        <IconButton
          icon="menu"
          onPress={() => navigation.openDrawer()}
          size={40}
        />
      </View>

      <View style={{ flex: 4, alignContent: 'center', alignItems: 'center' }}>
        <RandomGIFButton
          gifs={playerStyle.gifs}
          favList={String(currentPlayingId)}
        />
      </View>
      <View style={{ alignContent: 'flex-end' }}>
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
