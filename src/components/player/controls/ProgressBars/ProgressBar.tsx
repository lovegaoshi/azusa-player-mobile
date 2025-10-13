import React from 'react';
import { StyleSheet } from 'react-native';
import { useProgress } from 'react-native-track-player';
import { Slider } from '@react-native-assets/slider';

import { useNoxSetting } from '@stores/useApp';
import { TPSeek } from '@stores/RNObserverStore';
import {
  ProgressBarContainerProps,
  ProgressBarProps,
} from './ProgressBarProps';

export const SimpleProgressBar = ({
  thumbSize,
  progressThumbImage,
  trackHeight,
  style,
  trackStyle,
  enabled = true,
  progressInterval = 200,
  onValueChange,
}: ProgressBarProps) => {
  const { position, duration } = useProgress(progressInterval, false);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const enterSliding = useNoxSetting(state => state.enableMiniProgressSliding);
  const exitSliding = useNoxSetting(state => state.disableMiniProgressSliding);

  return (
    <Slider
      onValueChange={onValueChange}
      onSlidingStart={enterSliding}
      trackStyle={trackStyle}
      trackHeight={trackHeight}
      style={[styles.progressBar, style]}
      value={position}
      minimumValue={0}
      maximumValue={duration}
      thumbTintColor={
        progressThumbImage
          ? undefined
          : playerStyle.customColors.progressThumbTintColor
      }
      enabled={enabled}
      minimumTrackTintColor={playerStyle.colors.primary}
      maximumTrackTintColor={playerStyle.colors.secondaryContainer}
      onSlidingComplete={v => {
        TPSeek(v);
        exitSliding();
      }}
      thumbImage={progressThumbImage ? { uri: progressThumbImage } : undefined}
      thumbSize={thumbSize ?? (progressThumbImage ? 40 : undefined)}
      thumbStyle={{
        backgroundColor: progressThumbImage
          ? 'transparent'
          : playerStyle.colors.primary,
        elevation: 0,
      }}
      maxTrackStyle={styles.transparent}
    />
  );
};

export default function ProgressBar(p: ProgressBarContainerProps) {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  return (
    <SimpleProgressBar
      {...p}
      progressThumbImage={playerStyle.progressThumbImage}
    />
  );
}

const styles = StyleSheet.create({
  progressBar: {
    width: '100%',
    marginTop: 10,
    flexDirection: 'row',
    zIndex: 2,
  },
  transparent: { backgroundColor: 'transparent' },
});
