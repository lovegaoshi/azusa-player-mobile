import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import '../../localization/i18n';
import PlayerPanel from './FoldPlayerPanel';
import PlaylistPanel from './FoldPlaylistPanel';

const AzusaPlayer = () => {
  const { width } = Dimensions.get('window');
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
