import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import {
  IconButton,
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import merge from 'deepmerge';
import { useTranslation } from 'react-i18next';

import { Player } from './components/player/View';
import Playlist from './components/playlist/View';
import PlayerBottomPanel from './components/player/PlayerProgressControls';
import MainBackground from './components/background/MainBackground';
import { useNoxSetting } from './hooks/useSetting';
import PlaylistDrawer from './components/playlists/View';
import { ViewEnum } from './enums/View';
import Settings from './components/setting/View';
import DummySettings from './components/setting/DummySettings';
import './localization/i18n';
import Explore from './components/explore/ytmusic/View';
import PIPLyricView from './components/player/PIPLyric';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LandscapePlayer from './components/landscape/LandscapePlayer';
import LandscapeActions from './components/landscape/LandscapeActions';

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedDefaultTheme = merge(MD3LightTheme, LightTheme);
const CombinedDarkTheme = merge(MD3DarkTheme, DarkTheme);
const PlayerStyle = { backgroundColor: 'transparent' };

const NoxPlayer = () => {
  const Tab = createMaterialTopTabNavigator();

  return (
    <React.Fragment>
      <Tab.Navigator style={PlayerStyle}>
        <Tab.Screen
          name={ViewEnum.PLAYER_COVER}
          component={Player}
          options={{ tabBarStyle: { display: 'none' } }}
        />
        <Tab.Screen
          name={ViewEnum.PLAYER_PLAYLIST}
          component={Playlist}
          options={{ tabBarStyle: { display: 'none' } }}
        />
      </Tab.Navigator>
      <PlayerBottomPanel />
    </React.Fragment>
  );
};

const AzusaPlayer = () => {
  const { t } = useTranslation();
  const Drawer = createDrawerNavigator();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const defaultTheme = playerStyle.metaData.darkTheme
    ? CombinedDarkTheme
    : CombinedDefaultTheme;
  const insets = useSafeAreaInsets();
  const mobileWidth = Dimensions.get('window').width;
  const playerPanelWidth = mobileWidth / 2 - 100;

  return (
    <MainBackground>
      <PaperProvider
        theme={{
          ...defaultTheme,
          colors: playerStyle.colors,
        }}
      >
        <NavigationContainer
          theme={{
            ...defaultTheme,
            colors: {
              ...defaultTheme.colors,
              ...playerStyle.colors,
            },
          }}
        >
          <View
            style={{
              flex: 1,
              // Paddings to handle safe area
              paddingTop: insets.top,
              paddingLeft: insets.left,
              paddingRight: insets.right,
              flexDirection: 'row',
            }}
          >
            <LandscapeActions />
            <LandscapePlayer panelWidth={playerPanelWidth} />
            <View
              style={[styles.playlistPanel, { width: mobileWidth / 2 }]}
            ></View>
          </View>
        </NavigationContainer>
      </PaperProvider>
    </MainBackground>
  );
};

export default AzusaPlayer;

const styles = StyleSheet.create({
  sidebar: {
    width: 100,
    backgroundColor: 'black',
  },
  playerPanel: {},
  playlistPanel: {},
});
