import React from 'react';
import { Dimensions } from 'react-native';

import '../../localization/i18n';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import LandscapePlayerPanel from './LandscapePlayerPanel';
import LandscapeActions from './LandscapeActions';
import LandscapePlaylistPanel from './LandscapePlaylistPanel';

const AzusaPlayer = () => {
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get('window');
  const actionPanelWidth =
    Math.max(50, Math.min(120, height / 5)) + insets.left;
  const playerPanelWidth = Math.max(
    50,
    width / 2 - actionPanelWidth + insets.left,
  );
  return (
    <SafeAreaView
      style={{
        flex: 1,
        flexDirection: 'row',
      }}
      edges={{ top: 'off', bottom: 'off' }}
    >
      <LandscapeActions panelWidth={actionPanelWidth} />
      <LandscapePlayerPanel panelWidth={playerPanelWidth} />
      <LandscapePlaylistPanel panelWidth={width / 2} />
    </SafeAreaView>
  );
};

export default AzusaPlayer;
