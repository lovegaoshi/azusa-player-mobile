/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { IconButton, Divider, Text, TouchableRipple } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { View, ImageBackground, StyleSheet, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@stores/useApp';
import useAAPlayback from '@hooks/useAAPlayback';
import { NoxRoutes } from '@enums/Routes';
import { logger } from '@utils/Logger';
import Playlists from './Playlists';
import { BottomTabRouteIcons as RouteIcons } from '@enums/BottomTab';

interface Props {
  view: NoxRoutes;
  routeIcon?: RouteIcons;
  icon: string;
  text: string;
}
const RenderDrawerItem = ({ view, icon, text, routeIcon }: Props) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const setRoute = useNoxSetting(state => state.setBottomTabRoute);

  return (
    <TouchableRipple onPress={() => {
      navigation.navigate(view as never);
      if (routeIcon) setRoute(routeIcon);
    }}>
      <View style={styles.drawerItemContainer}>
        <IconButton icon={icon} size={32} />
        <View style={styles.drawerItemTextContainer}>
          <Text variant="titleLarge">{t(text)}</Text>
        </View>
      </View>
    </TouchableRipple>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BiliCard = (props: any) => {
  if (props.backgroundURI) {
    return (
      <ImageBackground source={{ uri: props.backgroundURI }}>
        {props.children}
      </ImageBackground>
    );
  }
  return <>{props.children}</>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (props: any) => {
  const navigation = useNavigation();
  const playlistIds = useNoxSetting(state => state.playlistIds);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  // HACK: I know its bad! But somehow this hook isnt updating in its own
  // useEffects...
  const { buildBrowseTree } = useAAPlayback();

  useEffect(() => {
    buildBrowseTree();
  }, [playlistIds.length]);

  useEffect(() => {
    function deepLinkHandler(data: { url: string }) {
      if (data.url === 'trackplayer://notification.click') {
        logger.debug('[Drawer] click from notification; navigate to home');
        navigation.navigate(NoxRoutes.PlayerHome as never);
      }
    }

    // This event will be fired when the app is already open and the notification is clicked
    const subscription = Linking.addEventListener('url', deepLinkHandler);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View {...props} style={{ flex: 1 }}>
      <View style={styles.topPadding} />
      <BiliCard backgroundURI={playerStyle.biliGarbCard}>
        <RenderDrawerItem
          icon={'home-outline'}
          view={NoxRoutes.PlayerHome}
          text={'appDrawer.homeScreenName'}
          routeIcon={RouteIcons.music}
        />
      </BiliCard>
      <RenderDrawerItem
        icon={'compass'}
        view={NoxRoutes.Explore}
        text={'appDrawer.exploreScreenName'}
        routeIcon={RouteIcons.explore}
      />
      <RenderDrawerItem
        icon={'cog'}
        view={NoxRoutes.Settings}
        text={'appDrawer.settingScreenName'}
        routeIcon={RouteIcons.setting}
      />
      <Divider />
      <Playlists />
    </View>
  );
};

const styles = StyleSheet.create({
  topPadding: {
    height: 10,
  },
  draggableFlatList: {},
  bottomInfo: {
    paddingBottom: 20,
  },
  bottomInfoText: {
    textAlign: 'center',
  },
  drawerItemContainer: { flexDirection: 'row' },
  drawerItemTextContainer: { justifyContent: 'center' },
});
