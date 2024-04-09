import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NoxRoutes } from '@enums/Routes';
import { useNoxSetting } from '@stores/useApp';
import RandomGIFButton from '../buttons/RandomGIF';

export default ({ navigation }: NoxComponent.NavigationProps) => {
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
          onPress={() => navigationGlobal.navigate(NoxRoutes.Playlist as never)}
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
