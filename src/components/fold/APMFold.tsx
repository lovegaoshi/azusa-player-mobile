import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import '../../localization/i18n';
import PlayerPanel from './FoldPlayerPanel';
import PlaylistPanel from './FoldPlaylistPanel';

const AzusaPlayer = () => {
  const { width } = useWindowDimensions();
  return (
    <SafeAreaView style={styles.safeArea} edges={{ top: 'off', bottom: 'off' }}>
      <PlayerPanel panelWidth={width / 2} />
      <PlaylistPanel panelWidth={width / 2} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    flexDirection: 'row',
  },
});

export default AzusaPlayer;
