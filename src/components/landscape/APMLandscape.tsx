import React from 'react';
import { Dimensions, View } from 'react-native';

import '../../localization/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LandscapePlayerPanel from './LandscapePlayerPanel';
import LandscapeActions from './LandscapeActions';
import LandscapePlaylistPanel from './LandscapePlaylistPanel';

const AzusaPlayer = () => {
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get('window');
  const actionPanelWidth = Math.max(50, Math.min(120, height / 5));
  const playerPanelWidth = Math.max(50, width / 2 - actionPanelWidth);

  return (
    <View
      style={{
        flex: 1,
        // Paddings to handle safe area
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        flexDirection: 'row',
      }}
    >
      <LandscapeActions panelWidth={actionPanelWidth} />
      <LandscapePlayerPanel panelWidth={playerPanelWidth} />
      <LandscapePlaylistPanel panelWidth={width / 2} />
    </View>
  );
};

export default AzusaPlayer;
