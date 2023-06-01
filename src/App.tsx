import React, { useEffect } from 'react';
import { Linking, SafeAreaView } from 'react-native';
import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  IconButton,
  Portal,
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import merge from 'deepmerge';
import { useTranslation } from 'react-i18next';

import { useSetupPlayer, Player } from './components/player/View';
import Playlist from './components/playlist/View';
import PlayerBottomPanel from './components/player/PlayerProgressControls';
import MainBackground from './components/background/MainBackground';
import { useNoxSetting } from './hooks/useSetting';
import PlaylistDrawer from './components/playlists/View';
import { ViewEnum } from './enums/View';
import Settings from './components/setting/View';
import './localization/i18n';
import AppOpenSplash from './components/background/AppOpenSplash';
import { DummySettings } from './components/setting/View';

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedDefaultTheme = merge(MD3LightTheme, LightTheme);
const CombinedDarkTheme = merge(MD3DarkTheme, DarkTheme);

const useSplash = (duration = 1000) => {
  const [isReady, setIsReady] = React.useState(false);
  useEffect(() => {
    // wait for 1000 ms and set isReady to true
    setTimeout(() => {
      setIsReady(true);
    }, duration);
  });
  return isReady;
};

const App: React.FC = () => {
  const { t } = useTranslation();
  const isPlayerReady = useSetupPlayer();
  const isSplashReady = useSplash(__DEV__ ? 1 : 2000);
  const Drawer = createDrawerNavigator();
  const Tab = createMaterialTopTabNavigator();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const defaultTheme = playerStyle.metaData.darkTheme
    ? CombinedDarkTheme
    : CombinedDefaultTheme;

  function NoxPlayer() {
    return (
      <React.Fragment>
        <Tab.Navigator style={{ backgroundColor: 'transparent' }}>
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
  }

  useEffect(() => {
    function deepLinkHandler(data: { url: string }) {
      console.log('deepLinkHandler', data.url);
    }

    // This event will be fired when the app is already open and the notification is clicked
    const subscription = Linking.addEventListener('url', deepLinkHandler);

    // When you launch the closed app from the notification or any other link
    Linking.getInitialURL().then(url => console.log('getInitialURL', url));

    return () => {
      subscription.remove();
    };
  }, []);

  if (!isPlayerReady || !isSplashReady) {
    // TODO: this is the splash screen. get something cool from lottie.
    return (
      <SafeAreaView style={playerStyle.screenContainer}>
        <AppOpenSplash />
      </SafeAreaView>
    );
  }
  // HACK: proof codewhisperer learns stackoverflow:
  // https://stackoverflow.com/questions/54599305/how-to-set-background-image-with-react-native-and-react-navigation
  return (
    <SafeAreaProvider>
      <MainBackground>
        <Portal.Host>
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
              <Drawer.Navigator
                initialRouteName={ViewEnum.PLAYER_HOME}
                drawerContent={PlaylistDrawer}
              >
                <Drawer.Screen
                  name={ViewEnum.PLAYER_HOME}
                  options={{
                    drawerIcon: () => <IconButton icon="home-outline" />,
                    title: String(t('appDrawer.homeScreenName')),
                    header: () => null,
                  }}
                  component={NoxPlayer}
                />
                <Drawer.Screen
                  name={ViewEnum.EXPORE}
                  options={{
                    drawerIcon: () => <IconButton icon="compass" />,
                    title: String(t('appDrawer.exploreScreenName')),
                    header: () => null,
                  }}
                  component={DummySettings}
                />
                <Drawer.Screen
                  name={ViewEnum.SETTINGS}
                  options={{
                    drawerIcon: () => <IconButton icon="cog" />,
                    title: String(t('appDrawer.settingScreenName')),
                    header: () => null,
                  }}
                  component={Settings}
                />
              </Drawer.Navigator>
            </NavigationContainer>
          </PaperProvider>
        </Portal.Host>
      </MainBackground>
    </SafeAreaProvider>
  );
};

export default App;
