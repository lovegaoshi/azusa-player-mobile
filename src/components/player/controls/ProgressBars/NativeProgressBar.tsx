import React from 'react';
import { StyleSheet } from 'react-native';
import { useProgress } from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import { useSharedValue } from 'react-native-reanimated';

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
  progressThumbImageRight,
  progressThumbImageLeft,
}: ProgressBarProps) => {
  const { position, duration } = useProgress(progressInterval, false);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const enterSliding = useNoxSetting(state => state.enableMiniProgressSliding);
  const exitSliding = useNoxSetting(state => state.disableMiniProgressSliding);
  const [thumbImage, setThumbImage] = React.useState(progressThumbImage);
  const slidingAtPosition = useSharedValue(0);

  React.useEffect(() => {
    setThumbImage(progressThumbImage);
  }, [progressThumbImage]);

  return (
    <Slider
      onSlidingStart={() => {
        enterSliding();
        slidingAtPosition.value = position;
      }}
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
      onValueChange={v => {
        duration && onValueChange?.(v / duration);
        if (v > slidingAtPosition.value) {
          setThumbImage(progressThumbImageRight);
        } else {
          setThumbImage(progressThumbImageLeft);
        }
        slidingAtPosition.value = v;
      }}
      disabled={!enabled}
      minimumTrackTintColor={playerStyle.colors.primary}
      maximumTrackTintColor={'transparent'}
      onSlidingComplete={v => {
        TPSeek(v);
        exitSliding();
        setThumbImage(progressThumbImage);
      }}
      sliderThickness={trackHeight}
      thumbSize={thumbSize}
      sliderCornerRoundness={100}
      thumbImage={thumbImage ? { uri: thumbImage } : undefined}
      // this is effectively calculated in seconds - default is total 128 ticks (duration/128 steps)
      step={progressInterval / 1000}
    />
  );
};

export default function NativeProgressBar(p: ProgressBarContainerProps) {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  return (
    <SimpleProgressBar
      {...p}
      progressThumbImage={playerStyle.progressThumbImage}
      progressThumbImageLeft={
        playerStyle.progressThumbImageLeftDrag ?? playerStyle.progressThumbImage
      }
      progressThumbImageRight={
        playerStyle.progressThumbImageRightDrag ??
        playerStyle.progressThumbImage
      }
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
