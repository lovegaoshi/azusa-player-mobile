import React from 'react';
import { StyleSheet, View } from 'react-native';
import { usePlayWhenReady, useProgress } from 'react-native-track-player';

import WaveAnimation from '../WavyAnimation';

export default () => {
  const playWhenReady = usePlayWhenReady();
  const { position, duration } = useProgress();

  if (position === 0) return;

  return (
    <View style={styles.waveProgressContainer}>
      <WaveAnimation playing={playWhenReady} progress={position / duration} />
    </View>
  );
};

const styles = StyleSheet.create({
  waveProgressContainer: {
    width: '100%',
    paddingHorizontal: 25,
    height: 30,
  },
});
