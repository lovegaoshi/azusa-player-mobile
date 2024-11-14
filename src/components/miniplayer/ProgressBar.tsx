import React, { useState } from 'react';
import { View } from 'react-native';
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated';

import { SimpleProgressBar } from '../player/controls/ProgressBar';
import { MinPlayerHeight } from './Constants';

export default ({ miniplayerHeight }: NoxComponent.MiniplayerProps) => {
  const [visible, setVisible] = useState(true);

  useAnimatedReaction(
    () => miniplayerHeight.value,
    curr => {
      if (curr === MinPlayerHeight) {
        return runOnJS(setVisible)(true);
      }
      runOnJS(setVisible)(false);
    },
  );

  if (!visible) {
    return null;
  }

  return (
    <View style={{ marginTop: -15 }}>
      <SimpleProgressBar thumbSize={0} trackHeight={2} />
    </View>
  );
};
