/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { IconButton, Divider, TouchableRipple } from 'react-native-paper';
import { View, ImageBackground, StyleSheet, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PaperText as Text } from '@components/commonui/ScaledText';
import { useNoxSetting } from '@stores/useApp';
import usePlaybackAA from '@hooks/usePlaybackAA';
import { NoxRoutes } from '@enums/Routes';
import { logger } from '@utils/Logger';
import Playlists from './Playlists';
import { BottomTabRouteIcons as RouteIcons } from '@enums/BottomTab';
import useNavigation from '@hooks/useNavigation';
import FlexView from '../commonui/FlexViewNewArch';
import useDrawerStatus from '@hooks/useDrawerStatus';
import { DrawerNavigationHelpers } from '@react-navigation/drawer/lib/typescript/src/types';

interface Props {
  view: NoxRoutes;
  routeIcon?: RouteIcons;
  icon: string;
  text: string;
  navigation: DrawerNavigationHelpers;
}
const RenderDrawerItem = ({
  view,
  icon,
  text,
  routeIcon,
  navigation,
}: Props) => {
  const noxNavigation = useNavigation(navigation);
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <TouchableRipple
      onPress={() =>
        noxNavigation.navigate({
          route: view,
          setIcon: routeIcon !== undefined,
        })
      }
    >
      <View style={styles.drawerItemContainer}>
        <IconButton
          icon={icon}
          size={32}
          iconColor={playerStyle.colors.primary}
        />
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

export default ({ navigation }: { navigation: DrawerNavigationHelpers }) => {
  const insets = useSafeAreaInsets();
  const playlistIds = useNoxSetting(state => state.playlistIds);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const toggleExpand = useNoxSetting(state => state.toggleExpand);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _drawerStatus = useDrawerStatus();

  // HACK: I know its bad! But somehow this hook isnt updating in its own
  // useEffects...
  const { buildBrowseTree } = usePlaybackAA();

  useEffect(() => {
    buildBrowseTree();
  }, [playlistIds.length]);

  useEffect(() => {
    function deepLinkHandler(data: { url: string }) {
      if (data.url === 'trackplayer://notification.click') {
        logger.debug('[Drawer] click from notification; navigate to home');
        navigation.navigate(NoxRoutes.PlayerHome);
        toggleExpand();
      }
    }

    // This event will be fired when the app is already open and the notification is clicked
    const subscription = Linking.addEventListener('url', deepLinkHandler);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <FlexView mkey={'drawer'}>
      <>
        <View style={{ height: 10 + insets.top }} />
        <BiliCard backgroundURI={playerStyle.biliGarbCard}>
          <RenderDrawerItem
            icon={'home-outline'}
            view={NoxRoutes.PlayerHome}
            text={'appDrawer.homeScreenName'}
            routeIcon={RouteIcons.music}
            navigation={navigation}
          />
        </BiliCard>
        <RenderDrawerItem
          icon={'compass'}
          view={NoxRoutes.Explore}
          text={'appDrawer.exploreScreenName'}
          routeIcon={RouteIcons.explore}
          navigation={navigation}
        />
        <RenderDrawerItem
          icon={'cog'}
          view={NoxRoutes.Settings}
          text={'appDrawer.settingScreenName'}
          routeIcon={RouteIcons.setting}
          navigation={navigation}
        />
        <Divider />
        <Playlists navigation={navigation} />
      </>
    </FlexView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
