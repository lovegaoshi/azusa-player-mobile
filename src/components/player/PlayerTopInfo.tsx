import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';

import { NoxRoutes } from '@enums/Routes';
import { useNoxSetting } from '@stores/useApp';
import RandomGIFButton from '../buttons/RandomGIF';
import useNavigation from '@hooks/useNavigation';

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
          iconColor={playerStyle.colors.primary}
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
            navigationGlobal.navigate({ route: NoxRoutes.Playlist })
          }
          size={40}
          iconColor={playerStyle.colors.primary}
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
