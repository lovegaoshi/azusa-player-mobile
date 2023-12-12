import React from 'react';
import { StyleSheet, View } from 'react-native';
import { usePlayWhenReady, useProgress } from 'react-native-track-player';

import WaveAnimation from '../WavyAnimation';
import { useNoxSetting } from '@stores/useApp';

export default () => {
  const playWhenReady = usePlayWhenReady();
  const { position, duration } = useProgress();
  const playerSetting = useNoxSetting(state => state.playerSetting);

  return (
    <View style={styles.waveProgressContainer}>
      {playerSetting.wavyProgressBar && position > 0 && (
        <WaveAnimation playing={playWhenReady} progress={position / duration} />
      )}
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
