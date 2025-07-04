import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';

import { SimpleProgressBar } from '../player/controls/ProgressBars/ProgressBar';
import { MinPlayerHeight } from './Constants';

export default ({ miniplayerHeight }: NoxComponent.MiniplayerProps) => {
  const [visible, setVisible] = useState(true);

  useAnimatedReaction(
    () => miniplayerHeight.value,
    curr => {
      runOnJS(setVisible)(curr === MinPlayerHeight);
    },
  );

  if (!visible) {
    return null;
  }

  return (
    <SimpleProgressBar
      thumbSize={0}
      trackHeight={2}
      style={styles.progressBar}
      trackStyle={styles.track}
      enabled={false}
    />
  );
};

const styles = StyleSheet.create({
  progressBar: { transform: [{ translateY: 43 }], position: 'absolute' },
  track: { borderRadius: 0 },
});
