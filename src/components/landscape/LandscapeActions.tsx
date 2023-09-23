import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';

import { ICONS } from '@enums/Icons';
import RandomGIFButton from '../buttons/RandomGIF';
import { useNoxSetting } from '@hooks/useSetting';

export default () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const iconSize = 80;

  return (
    <View style={styles.sidebar}>
      <View style={styles.randomGifButtonContainerStyle}>
        <RandomGIFButton
          gifs={playerStyle.gifs}
          favList={String(currentPlayingId)}
          iconsize={iconSize}
        />
      </View>
      <IconButton icon={ICONS.homeScreen} size={iconSize} />
      <IconButton icon={ICONS.exploreScreen} size={iconSize} />
      <IconButton icon={ICONS.settingScreen} size={iconSize} />
      <IconButton icon={ICONS.playlistScreen} size={iconSize} />
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 100,
    flexDirection: 'column',
    backgroundColor: 'lightgrey',
  },
  randomGifButtonContainerStyle: {
    paddingTop: 20,
    alignContent: 'center',
    alignItems: 'center',
  },
});
