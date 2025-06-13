import React, { useEffect } from 'react';
import { ParamListBase } from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerNavigationProp,
} from '@react-navigation/drawer';
import { IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import Home from './portrait/View';
import PlaylistDrawer from './playlists/View';
import { NoxRoutes } from '../enums/Routes';
import Settings from './setting/View';
import Explore from './explore/View';
import '../localization/i18n';
import { ScreenIcons } from '@enums/Icons';
import NoxBottomTab from './bottomtab/NoxBottomTab';
import NoxMiniPlayer from './miniplayer/View';
import NoxNativeBottomTab from './bottomtab/NoxNativeBottomTab';

const HomeIcon = () => <IconButton icon={ScreenIcons.HomeScreen} />;
const ExploreIcon = () => <IconButton icon={ScreenIcons.ExploreScreen} />;
const SettingIcon = () => <IconButton icon={ScreenIcons.SettingScreen} />;

const AzusaPlayer = () => {
  const { t } = useTranslation();
  const Drawer = createDrawerNavigator();
  const [navigation, setNavigation] =
    React.useState<DrawerNavigationProp<ParamListBase>>();

  const APMHome = ({ navigation }: NoxComponent.NavigationProps) => {
    useEffect(() => setNavigation(navigation), []);
    return <Home />;
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
      edges={{ top: 'off', bottom: 'off' }}
    >
      <Drawer.Navigator
        initialRouteName={NoxRoutes.PlayerHome}
        drawerContent={PlaylistDrawer}
        screenOptions={{
          drawerType: 'slide',
          drawerStyle: {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          },
        }}
      >
        <Drawer.Screen
          name={NoxRoutes.PlayerHome}
          options={{
            drawerIcon: HomeIcon,
            title: t('appDrawer.homeScreenName'),
            header: () => null,
          }}
          component={APMHome}
        />
        <Drawer.Screen
          name={NoxRoutes.Explore}
          options={{
            drawerIcon: ExploreIcon,
            title: t('appDrawer.exploreScreenName'),
            header: () => null,
          }}
          component={Explore}
        />
        <Drawer.Screen
          name={NoxRoutes.Settings}
          options={{
            drawerIcon: SettingIcon,
            title: t('appDrawer.settingScreenName'),
            header: () => null,
          }}
          component={Settings}
        />
      </Drawer.Navigator>
      <NoxMiniPlayer />
      <NoxNativeBottomTab />
      <NoxBottomTab navigation={navigation} />
    </SafeAreaView>
  );
};

export default AzusaPlayer;
