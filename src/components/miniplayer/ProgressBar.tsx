import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';

import { SimpleProgressBar } from '../player/controls/ProgressBar';
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
    />
  );
};

const styles = StyleSheet.create({
  progressBar: { transform: [{ translateY: -15 }] },
  track: { borderRadius: 0 },
});
