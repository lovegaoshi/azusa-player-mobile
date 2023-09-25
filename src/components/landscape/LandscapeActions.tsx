import React, { useEffect } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useNavigation, ParamListBase } from '@react-navigation/native';

import { ICONS } from '@enums/Icons';
import RandomGIFButton from '../buttons/RandomGIF';
import { useNoxSetting } from '@hooks/useSetting';
import { ViewEnum } from '@enums/View';
import { logger } from '@utils/Logger';

export default () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const iconSize = 80;
  const navigationGlobal = useNavigation();

  const onPlaylistPress = () => {
    navigationGlobal.navigate(
      navigationGlobal.getState()?.routes?.at(-1)?.name ===
        ViewEnum.PLAYER_PLAYLIST
        ? (ViewEnum.PLAYER_PLAYLISTS as never)
        : (ViewEnum.PLAYER_PLAYLIST as never)
    );
  };

  useEffect(() => {
    function deepLinkHandler(data: { url: string }) {
      if (data.url === 'trackplayer://notification.click') {
        logger.debug('[Drawer] click from notification; navigate to home');
        navigationGlobal.navigate(ViewEnum.PLAYER_HOME as never);
      }
    }
    // This event will be fired when the app is already open and the notification is clicked
    const subscription = Linking.addEventListener('url', deepLinkHandler);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.sidebar}>
      <View style={styles.randomGifButtonContainerStyle}>
        <RandomGIFButton
          gifs={playerStyle.gifs}
          favList={String(currentPlayingId)}
          iconsize={iconSize}
        />
      </View>
      <IconButton
        icon={ICONS.homeScreen}
        size={iconSize}
        onPress={() => navigationGlobal.navigate(ViewEnum.LYRICS as never)}
      />
      <IconButton
        icon={ICONS.playlistScreen}
        size={iconSize}
        onPress={onPlaylistPress}
      />
      <IconButton
        icon={ICONS.exploreScreen}
        size={iconSize}
        onPress={() => navigationGlobal.navigate(ViewEnum.EXPORE as never)}
      />
      <IconButton
        icon={ICONS.settingScreen}
        size={iconSize}
        onPress={() => navigationGlobal.navigate(ViewEnum.SETTINGS as never)}
      />
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
