import React, { useEffect } from 'react';
import { View } from 'react-native';
import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ParamListBase,
} from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerNavigationProp,
} from '@react-navigation/drawer';
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

import Player from './components/player/View';
import Playlist from './components/playlist/View';
import PlayerBottomPanel from './components/player/controls/PlayerProgressControls';
import { useNoxSetting } from '@stores/useApp';
import PlaylistDrawer from './components/playlists/View';
import { ViewEnum } from './enums/View';
import Settings from './components/setting/View';
import Explore from './components/explore/View';
import './localization/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenIcons } from '@enums/Icons';
import NoxBottomTab from './components/bottomtab/NoxBottomTab';

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedDefaultTheme = merge(MD3LightTheme, LightTheme);
const CombinedDarkTheme = merge(MD3DarkTheme, DarkTheme);
const PlayerStyle = { backgroundColor: 'transparent' };

interface Props extends NoxComponent.NavigationProps {
  setNavigation?: (val: DrawerNavigationProp<ParamListBase>) => void;
}
const NoxPlayer = ({ navigation, setNavigation = () => undefined }: Props) => {
  const Tab = createMaterialTopTabNavigator();

  useEffect(() => setNavigation(navigation), []);

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
  const [navigation, setNavigation] =
    React.useState<DrawerNavigationProp<ParamListBase>>();

  const NoxPlayerWrapper = ({ navigation }: Props) =>
    NoxPlayer({ navigation, setNavigation });

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
                drawerIcon: () => <IconButton icon={ScreenIcons.homeScreen} />,
                title: String(t('appDrawer.homeScreenName')),
                header: () => null,
              }}
              component={NoxPlayerWrapper}
            />
            <Drawer.Screen
              name={ViewEnum.EXPORE}
              options={{
                drawerIcon: () => (
                  <IconButton icon={ScreenIcons.exploreScreen} />
                ),
                title: String(t('appDrawer.exploreScreenName')),
              }}
              component={Explore}
            />
            <Drawer.Screen
              name={ViewEnum.SETTINGS}
              options={{
                drawerIcon: () => (
                  <IconButton icon={ScreenIcons.settingScreen} />
                ),
                title: String(t('appDrawer.settingScreenName')),
                header: () => null,
              }}
              component={Settings}
            />
          </Drawer.Navigator>
          <NoxBottomTab navigation={navigation} />
        </View>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default AzusaPlayer;
