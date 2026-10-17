import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useAnimatedReaction } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { MinPlayerHeight } from './Constants';
import { MiniProgressBar } from '../player/controls/ProgressBars/ProgressBar';

export default function MiniplayerProgressBar({
  miniplayerHeight,
}: NoxComponent.MiniplayerProps) {
  const [visible, setVisible] = useState(true);

  useAnimatedReaction(
    () => miniplayerHeight.value,
    curr => {
      scheduleOnRN(setVisible, curr === MinPlayerHeight);
    },
  );

  if (!visible) {
    return null;
  }

  return (
    <MiniProgressBar
      thumbSize={0}
      trackHeight={2}
      style={styles.progressBar}
      trackStyle={styles.track}
      enabled={false}
    />
  );
}

const styles = StyleSheet.create({
  progressBar: { transform: [{ translateY: 43 }], position: 'absolute' },
  track: { borderRadius: 0 },
});
