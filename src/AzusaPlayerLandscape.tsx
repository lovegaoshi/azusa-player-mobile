import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import {
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import merge from 'deepmerge';
import { useTranslation } from 'react-i18next';

import MainBackground from './components/background/MainBackground';
import { useNoxSetting } from './hooks/useSetting';
import './localization/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LandscapePlayerPanel from './components/landscape/LandscapePlayerPanel';
import LandscapeActions from './components/landscape/LandscapeActions';
import LandscapePlaylistPanel from './components/landscape/LandscapePlaylistPanel';

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedDefaultTheme = merge(MD3LightTheme, LightTheme);
const CombinedDarkTheme = merge(MD3DarkTheme, DarkTheme);

const AzusaPlayer = () => {
  const { t } = useTranslation();
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
            <LandscapePlayerPanel panelWidth={playerPanelWidth} />
            <LandscapePlaylistPanel panelWidth={mobileWidth / 2} />
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
