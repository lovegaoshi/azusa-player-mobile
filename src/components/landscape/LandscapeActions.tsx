import React, { useEffect } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';

import { ScreenIcons } from '@enums/Icons';
import RandomGIFButton from '../buttons/RandomGIF';
import useNavigation from '@hooks/useNavigation';
import { useNoxSetting } from '@stores/useApp';
import { NoxRoutes } from '@enums/Routes';
import { logger } from '@utils/Logger';

interface Props {
  panelWidth?: number;
}
export default ({ panelWidth = 110 }: Props) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const navigation = useNavigation();
  const iconSize = panelWidth - 30;

  const onPlaylistPress = () => {
    navigation.navigate({
      route:
        navigation.getState()?.routes?.at(-1)?.name === NoxRoutes.Playlist
          ? NoxRoutes.PlaylistsDrawer
          : NoxRoutes.Playlist,
    });
  };

  useEffect(() => {
    function deepLinkHandler(data: { url: string }) {
      if (data.url === 'trackplayer://notification.click') {
        logger.debug('[Drawer] click from notification; navigate to home');
        navigation.navigate({ route: NoxRoutes.PlayerHome });
      }
    }
    // This event will be fired when the app is already open and the notification is clicked
    const subscription = Linking.addEventListener('url', deepLinkHandler);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View
      style={[
        styles.sidebar,
        {
          width: panelWidth,
          backgroundColor: playerStyle.metaData.darkTheme
            ? 'rgb(44, 40, 49)'
            : 'rgb(243, 237, 246)',
        },
      ]}
    >
      <View style={styles.randomGifButtonContainerStyle}>
        <RandomGIFButton
          gifs={playerStyle.gifs}
          favList={String(currentPlayingId)}
          iconsize={iconSize}
        />
      </View>
      <IconButton
        icon={ScreenIcons.HomeScreen}
        size={iconSize}
        onPress={() => navigation.navigate(NoxRoutes.Lyrics as never)}
      />
      <IconButton
        icon={ScreenIcons.PlaylistScreen}
        size={iconSize}
        onPress={onPlaylistPress}
      />
      <IconButton
        icon={ScreenIcons.ExploreScreen}
        size={iconSize}
        onPress={() => navigation.navigate(NoxRoutes.Explore as never)}
      />
      <IconButton
        icon={ScreenIcons.SettingScreen}
        size={iconSize}
        onPress={() => navigation.navigate(NoxRoutes.Settings as never)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    flexDirection: 'column',
    backgroundColor: 'lightgrey',
  },
  randomGifButtonContainerStyle: {
    paddingTop: 20,
    alignContent: 'center',
    alignItems: 'center',
  },
});
