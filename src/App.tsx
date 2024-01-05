import { SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useEffect } from 'react';
import { Linking, SafeAreaView, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useStore } from 'zustand';

import AzusaPlayer from './AzusaPlayer';
import AzusaPlayerLandscape from './components/landscape/AzusaPlayerLandscape';
import AppOpenSplash from './components/background/AppOpenSplash';
import useSetupPlayer from './hooks/useSetupPlayer';
import { useIsLandscape } from './hooks/useOrientation';
import appStore from '@stores/appStore';
import PIPLyricView from './components/player/PIPLyric';
import MainBackground from './components/background/MainBackground';

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

export default function App() {
  const isSplashReady = useSplash(__DEV__ ? 1 : 2500);
  const isPlayerReady = useSetupPlayer();
  const isLandscape = useIsLandscape();
  const PIPMode = useStore(appStore, state => state.pipMode);

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
    return (
      <SafeAreaView style={styles.screenContainer}>
        <AppOpenSplash />
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.gestureContainer}>
      <SafeAreaProvider>
        <MainBackground>
          {PIPMode ? (
            <PIPLyricView />
          ) : isLandscape ? (
            <AzusaPlayerLandscape />
          ) : (
            <AzusaPlayer />
          )}
        </MainBackground>
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
