import { SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useEffect } from 'react';
import { Linking, View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useStore } from 'zustand';
import * as Sentry from '@sentry/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';

import AppOpenSplash from './components/background/AppOpenSplash';
import useSetupPlayer from './hooks/useSetupPlayer';
import { useIsLandscape } from './hooks/useOrientation';
import appStore from '@stores/appStore';
import MainBackground from './components/background/MainBackground';
import useTheme from './hooks/useTheme';
// eslint-disable-next-line import/no-unresolved
import { TRACKING } from '@env';
import { useSetupVIP } from './hooks/useVIP';
import SongMenuSheet from '@components/songmenu/SongMenuSheet';
import { useNoxSetting } from '@stores/useApp';
import SnackBar from './components/commonui/Snackbar';
import APM from './components/APM';
import {
  CombinedDarkTheme,
  CombinedDefaultTheme,
} from './components/styles/Theme';

if (TRACKING) {
  Sentry.init({
    dsn: 'https://2662633cce5b4b9f99da6b395b0a471f@o4505087864799232.ingest.us.sentry.io/4505087866044416',
    tracesSampleRate: 0,
    ignoreErrors: [
      'Network request failed',
      'Download interrupted.',
      /Failed to delete /,
      'Cannot convert undefined value to object',
      'no audio url',
      'com.google.android.play.core.appupdate.internal.zzy',
      'TEST - Sentry Client Crash',
      // its ok to not track muse error i think
      /MuseError/,
    ],
  });
}

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

export default function App(appProps: NoxComponent.AppProps) {
  const { vip } = useSetupVIP();
  const isSplashReady = useSplash(
    __DEV__ || appProps.intentData || vip ? 1 : 2500,
  );
  const [isSplashAnimReady, setIsSplashAnimReady] = React.useState(vip);
  const isPlayerReady = useSetupPlayer({ ...appProps, vip });
  const isLandscape = useIsLandscape();
  const PIPMode = useStore(appStore, state => state.pipMode);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const usedTheme = useTheme();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const defaultTheme = playerStyle.metaData.darkTheme
    ? CombinedDarkTheme
    : CombinedDefaultTheme;
  const defaultNavTheme = playerStyle.metaData.darkTheme
    ? NavigationDarkTheme
    : NavigationDefaultTheme;

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

  if (!(isPlayerReady && isSplashReady && isSplashAnimReady)) {
    return (
      <SafeAreaProvider>
        <View style={styles.screenContainer}>
          <AppOpenSplash setIsSplashReady={setIsSplashAnimReady} />
        </View>
      </SafeAreaProvider>
    );
  }
  return (
    <GestureHandlerRootView style={styles.gestureContainer}>
      <SafeAreaProvider>
        <MainBackground />
        <View
          style={{ backgroundColor: playerStyle.colors.background, flex: 1 }}
        >
          <PaperProvider
            theme={{
              ...defaultTheme,
              colors: playerStyle.colors,
            }}
          >
            <APM
              PIP={PIPMode}
              isLandscape={isLandscape}
              defaultNavTheme={defaultNavTheme}
              defaultTheme={defaultTheme}
            />
            <SongMenuSheet />
            <SnackBar />
          </PaperProvider>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gestureContainer: {
    flex: 1,
  },
});
