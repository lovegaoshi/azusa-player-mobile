import React from 'react';
import { StyleSheet } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { useStore } from 'zustand';

import { useNoxSetting } from '@stores/useApp';
import appStore from '@stores/appStore';

export default () => {
  const fetchProgress = useStore(appStore, state => state.fetchProgress);
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <ProgressBar
      progress={fetchProgress / 100}
      color={playerStyle.colors.secondary}
      style={[
        styles.progressBarDouble,
        { backgroundColor: playerStyle.colors.secondaryContainer },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  progressBarDouble: {
    position: 'absolute',
    top: -14,
    alignSelf: 'center',
    backgroundColor: 'lightgrey',
    borderRadius: 5,
  },
});
