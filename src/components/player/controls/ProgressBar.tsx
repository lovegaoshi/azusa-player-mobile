import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { Slider } from '@react-native-assets/slider';

import { useNoxSetting } from '@stores/useApp';

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
  trackHeight,
  style,
  trackStyle,
  enabled = true,
  progressInterval = 200,
}: Props) => {
  const { position, duration } = useProgress(progressInterval, false);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const enterSliding = useNoxSetting(state => state.enableMiniProgressSliding);
  const exitSliding = useNoxSetting(state => state.disableMiniProgressSliding);

  return (
    <Slider
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
        TrackPlayer.seekTo(v);
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
