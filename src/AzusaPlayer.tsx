import React, { useEffect } from 'react';
import { NativeModules, Platform, View } from 'react-native';
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
import { useNoxSetting } from './hooks/useSetting';
import PlaylistDrawer from './components/playlists/View';
import { ViewEnum } from './enums/View';
import Settings from './components/setting/View';
import DummySettings from './components/setting/DummySettings';
import './localization/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ICONS } from '@enums/Icons';

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const { NoxAndroidAutoModule } = NativeModules;

const CombinedDefaultTheme = merge(MD3LightTheme, LightTheme);
const CombinedDarkTheme = merge(MD3DarkTheme, DarkTheme);
const PlayerStyle = { backgroundColor: 'transparent' };

const NoxAndroidBottomTab = () => {
  const [gestureMode, setGestureMode] = React.useState(false);
  useEffect(() => {
    // TODO: how to use await instead of states and useEffect?
    if (Platform.OS === 'android') {
      NoxAndroidAutoModule.isGestureNavigationMode().then(setGestureMode);
    }
  }, []);

  if (gestureMode) {
    return <></>;
  }
  return <></>;
};

const NoxPlayer = () => {
  const Tab = createMaterialTopTabNavigator();

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
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
      <NoxAndroidBottomTab />
    </View>
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
        }}
      >
        <View
          style={{
            flex: 1,
            // Paddings to handle safe area
            paddingTop: insets.top,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          }}
        >
          <Drawer.Navigator
            initialRouteName={ViewEnum.PLAYER_HOME}
            drawerContent={PlaylistDrawer}
          >
            <Drawer.Screen
              name={ViewEnum.PLAYER_HOME}
              options={{
                drawerIcon: () => <IconButton icon={ICONS.homeScreen} />,
                title: String(t('appDrawer.homeScreenName')),
                header: () => null,
              }}
              component={NoxPlayer}
            />
            <Drawer.Screen
              name={ViewEnum.EXPORE}
              options={{
                drawerIcon: () => <IconButton icon={ICONS.exploreScreen} />,
                title: String(t('appDrawer.exploreScreenName')),
              }}
              component={DummySettings}
            />
            <Drawer.Screen
              name={ViewEnum.SETTINGS}
              options={{
                drawerIcon: () => <IconButton icon={ICONS.settingScreen} />,
                title: String(t('appDrawer.settingScreenName')),
                header: () => null,
              }}
              component={Settings}
            />
          </Drawer.Navigator>
        </View>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default AzusaPlayer;
