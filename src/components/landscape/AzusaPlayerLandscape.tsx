import React from 'react';
import { Dimensions, View } from 'react-native';
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

import { useNoxSetting } from '@stores/useApp';
import '../../localization/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LandscapePlayerPanel from './LandscapePlayerPanel';
import LandscapeActions from './LandscapeActions';
import LandscapePlaylistPanel from './LandscapePlaylistPanel';
import SnackBar from '../commonui/Snackbar';

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedDefaultTheme = merge(MD3LightTheme, LightTheme);
const CombinedDarkTheme = merge(MD3DarkTheme, DarkTheme);

const AzusaPlayer = () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const defaultTheme = playerStyle.metaData.darkTheme
    ? CombinedDarkTheme
    : CombinedDefaultTheme;
  const defaultNavTheme = playerStyle.metaData.darkTheme
    ? NavigationDarkTheme
    : NavigationDefaultTheme;
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get('window');
  const actionPanelWidth = Math.max(50, Math.min(120, height / 5));
  const playerPanelWidth = Math.max(50, width / 2 - actionPanelWidth);

  console.log(actionPanelWidth, playerPanelWidth);
  return (
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
            // HACK: compensate for my bad design. now applying background
            // at MainBackground level instaed of here.
            background: undefined,
          },
          fonts: defaultNavTheme.fonts,
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
          <LandscapeActions panelWidth={actionPanelWidth} />
          <LandscapePlayerPanel panelWidth={playerPanelWidth} />
          <LandscapePlaylistPanel panelWidth={width / 2} />
        </View>
      </NavigationContainer>
      <SnackBar />
    </PaperProvider>
  );
};

export default AzusaPlayer;
