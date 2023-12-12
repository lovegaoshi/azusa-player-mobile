import React from 'react';
import { StyleSheet, View } from 'react-native';
import { usePlayWhenReady } from 'react-native-track-player';

import WaveAnimation from '../WavyAnimation';

export default () => {
  const playWhenReady = usePlayWhenReady();
  return (
    <View style={styles.waveProgressContainer}>
      <WaveAnimation playing={playWhenReady} />
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
