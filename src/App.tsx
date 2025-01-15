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
// eslint-disable-next-line import/no-unresolved
import { TRACKING } from '@env';
import { useSetupVIP } from './hooks/useVIP';

Sentry.nativeCrash();
export default () => <></>;
