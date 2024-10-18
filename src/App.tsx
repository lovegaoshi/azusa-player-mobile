import { SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useEffect } from 'react';
import { Linking, SafeAreaView, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useStore } from 'zustand';
import * as Sentry from '@sentry/react-native';

import AzusaPlayer from './AzusaPlayer';
import AzusaPlayerLandscape from './components/landscape/AzusaPlayerLandscape';
import AppOpenSplash from './components/background/AppOpenSplash';
import useSetupPlayer from './hooks/useSetupPlayer';
import { useIsLandscape } from './hooks/useOrientation';
import appStore from '@stores/appStore';
import PIPLyricView from './components/player/PIPLyric';
import MainBackground from './components/background/MainBackground';
import useTheme from './hooks/useTheme';
import VoicePlayer from './components/background/VoicePlayer';
// eslint-disable-next-line import/no-unresolved
import { TRACKING } from '@env';

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

const APM = ({ PIP, isLandscape }: { PIP: boolean; isLandscape: boolean }) => {
  if (PIP) return <PIPLyricView />;
  if (isLandscape) return <AzusaPlayerLandscape />;
  return <AzusaPlayer />;
};

export default function App(appProps: NoxComponent.AppProps) {
  const isSplashReady = useSplash(__DEV__ || appProps.intentData ? 1 : 2500);
  const [isSplashAnimReady, setIsSplashReady] = React.useState(false);
  const isPlayerReady = useSetupPlayer(appProps);
  const isLandscape = useIsLandscape();
  const PIPMode = useStore(appStore, state => state.pipMode);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const usedTheme = useTheme();

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
      <SafeAreaView style={styles.screenContainer}>
        <AppOpenSplash setIsSplashReady={setIsSplashReady} />
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.gestureContainer}>
      <MainBackground>
        <SafeAreaProvider>
          <APM PIP={PIPMode} isLandscape={isLandscape} />
        </SafeAreaProvider>
      </MainBackground>
      <VoicePlayer />
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
