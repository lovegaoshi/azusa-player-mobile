import React from 'react';
import { StyleSheet } from 'react-native';
import { useProgress } from 'react-native-track-player';
import Slider from '@react-native-community/slider';

import { useNoxSetting } from '@stores/useApp';
import { TPSeek } from '@stores/RNObserverStore';
import {
  ProgressBarContainerProps,
  ProgressBarProps,
} from './ProgressBarProps';

export const SimpleProgressBar = ({
  thumbSize,
  progressThumbImage,
  trackHeight = 10,
  style,
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
      onSlidingStart={enterSliding}
      tapToSeek
      style={[styles.progressBar, style]}
      value={position}
      minimumValue={0}
      maximumValue={duration}
      thumbTintColor={
        progressThumbImage
          ? undefined
          : (playerStyle.customColors.progressThumbTintColor ??
            playerStyle.colors.primary)
      }
      onValueChange={v => onValueChange?.(v / duration)}
      disabled={!enabled}
      minimumTrackTintColor={playerStyle.colors.primary}
      maximumTrackTintColor={'transparent'}
      onSlidingComplete={v => {
        TPSeek(v);
        exitSliding();
      }}
      sliderThickness={trackHeight}
      thumbSize={thumbSize}
      sliderCornerRoundness={100}
      thumbImage={progressThumbImage ? { uri: progressThumbImage } : undefined}
      // this is effectively calculated in seconds - default is total 128 ticks (duration/128 steps)
      step={progressInterval / 1000}
    />
  );
};

export default (p: ProgressBarContainerProps) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  return (
    <SimpleProgressBar
      {...p}
      progressThumbImage={playerStyle.progressThumbImage}
    />
  );
};

const styles = StyleSheet.create({
  progressBar: {
    width: '100%',
    marginTop: 10,
    flexDirection: 'row',
    zIndex: 2,
  },
  transparent: { backgroundColor: 'transparent' },
});
