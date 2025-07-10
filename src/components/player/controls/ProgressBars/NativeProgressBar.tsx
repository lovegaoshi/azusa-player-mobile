import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { useProgress } from 'react-native-track-player';
import Slider from '@react-native-community/slider';

import { useNoxSetting } from '@stores/useApp';
import { TPSeek } from '@stores/RNObserverStore';

interface Props {
  thumbSize?: number;
  progressThumbImage?: string;
  trackHeight?: number;
  style?: ViewStyle;
  trackStyle?: ViewStyle;
  enabled?: boolean;
  progressInterval?: number;
}
export const SimpleProgressBar = ({
  thumbSize,
  progressThumbImage,
  trackHeight = 10,
  style,
  enabled = true,
  progressInterval = 200,
}: Props) => {
  const { position, duration } = useProgress(progressInterval, false);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  return (
    <Slider
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
      disabled={!enabled}
      minimumTrackTintColor={playerStyle.colors.primary}
      maximumTrackTintColor={'transparent'}
      onSlidingComplete={v => TPSeek(v)}
      sliderThickness={trackHeight}
      thumbSize={thumbSize}
      sliderCornerRoundness={100}
      thumbImage={progressThumbImage ? { uri: progressThumbImage } : undefined}
      // this is effectively calculated in seconds - default is total 128 ticks (duration/128 steps)
      step={progressInterval / 1000}
    />
  );
};

export default () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  return (
    <SimpleProgressBar progressThumbImage={playerStyle.progressThumbImage} />
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
