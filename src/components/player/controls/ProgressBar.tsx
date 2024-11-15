import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { Slider } from '@sharcoux/slider';

import { useNoxSetting } from '@stores/useApp';

interface Props {
  thumbSize?: number;
  progressThumbImage?: string;
  trackHeight?: number;
  style?: ViewStyle;
  trackStyle?: ViewStyle;
}
export const SimpleProgressBar = ({
  thumbSize,
  progressThumbImage,
  trackHeight,
  style,
  trackStyle,
}: Props) => {
  const { position, duration } = useProgress(200);
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <Slider
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
      minimumTrackTintColor={playerStyle.colors.primary}
      maximumTrackTintColor={playerStyle.colors.secondaryContainer}
      onSlidingComplete={TrackPlayer.seekTo}
      thumbImage={progressThumbImage ? { uri: progressThumbImage } : undefined}
      thumbSize={thumbSize ?? (progressThumbImage ? 40 : undefined)}
      thumbStyle={{
        backgroundColor: progressThumbImage
          ? 'transparent'
          : playerStyle.colors.primary,
      }}
      maxTrackStyle={styles.transparent}
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
