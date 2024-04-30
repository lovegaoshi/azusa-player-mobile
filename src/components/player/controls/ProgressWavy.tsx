import React from 'react';
import { StyleSheet, View } from 'react-native';
import { usePlayWhenReady, useProgress } from 'react-native-track-player';

import WaveAnimation from './WavyAnimation';
import { useNoxSetting } from '@stores/useApp';

export default () => {
  const playWhenReady = usePlayWhenReady();
  const { position, duration } = useProgress();
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <View style={styles.waveProgressContainer}>
      {playerSetting.wavyProgressBar && (
        <WaveAnimation
          playing={playWhenReady}
          progress={position / duration}
          color={playerStyle.customColors.progressMinimumTrackTintColor}
        />
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
