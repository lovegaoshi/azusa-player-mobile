import React from 'react';
import { Dimensions } from 'react-native';

import '../../localization/i18n';
import { SafeAreaView } from 'react-native-safe-area-context';
import LandscapePlayerPanel from './LandscapePlayerPanel';
import LandscapeActions from './LandscapeActions';
import LandscapePlaylistPanel from './LandscapePlaylistPanel';

const AzusaPlayer = () => {
  const { width, height } = Dimensions.get('window');
  const actionPanelWidth = Math.max(50, Math.min(120, height / 5));
  const playerPanelWidth = Math.max(50, width / 2 - actionPanelWidth);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        flexDirection: 'row',
      }}
    >
      <LandscapeActions panelWidth={actionPanelWidth} />
      <LandscapePlayerPanel panelWidth={playerPanelWidth} />
      <LandscapePlaylistPanel panelWidth={width / 2} />
    </SafeAreaView>
  );
};

export default AzusaPlayer;
