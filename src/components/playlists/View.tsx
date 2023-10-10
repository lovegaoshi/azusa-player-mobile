/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { IconButton, Divider, Text, TouchableRipple } from 'react-native-paper';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { View, ImageBackground, StyleSheet, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';

import { useNoxSetting } from '@hooks/useSetting';
import useAAPlayback from '@hooks/useAAPlayback';
import { ViewEnum } from '@enums/View';
import appStore from '@stores/appStore';
import { logger } from '@utils/Logger';
import Playlists from './Playlists';

interface Props {
  view: string;
  icon: string;
  text: string;
}
const RenderDrawerItem = ({ view, icon, text }: Props) => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <TouchableRipple onPress={() => navigation.navigate(view as never)}>
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
  const PIPMode = useStore(appStore, state => state.pipMode);

  useEffect(() => {
    buildBrowseTree();
  }, [playlistIds.length]);

  useEffect(() => {
    if (PIPMode) {
      navigation.navigate(ViewEnum.LYRICS as never);
      navigation.dispatch(DrawerActions.closeDrawer());
    } else {
      navigation.goBack();
    }
  }, [PIPMode]);

  useEffect(() => {
    function deepLinkHandler(data: { url: string }) {
      if (data.url === 'trackplayer://notification.click') {
        logger.debug('[Drawer] click from notification; navigate to home');
        navigation.navigate(ViewEnum.PLAYER_HOME as never);
      }
    }

    // This event will be fired when the app is already open and the notification is clicked
    const subscription = Linking.addEventListener('url', deepLinkHandler);

    return () => {
      subscription.remove();
    };
  }, []);

  return PIPMode ? (
    <></>
  ) : (
    <View {...props} style={{ flex: 1 }}>
      <View style={styles.topPadding} />
      <BiliCard backgroundURI={playerStyle.biliGarbCard}>
        <RenderDrawerItem
          icon={'home-outline'}
          view={ViewEnum.PLAYER_HOME}
          text={'appDrawer.homeScreenName'}
        />
      </BiliCard>
      <RenderDrawerItem
        icon={'compass'}
        view={ViewEnum.EXPORE}
        text={'appDrawer.exploreScreenName'}
      />
      <RenderDrawerItem
        icon={'cog'}
        view={ViewEnum.SETTINGS}
        text={'appDrawer.settingScreenName'}
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
  addPlaylistButtonContainer: {
    height: 50,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlaylistButtonContent: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlaylistButtonSpacer: {
    width: 40,
    height: 40,
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
