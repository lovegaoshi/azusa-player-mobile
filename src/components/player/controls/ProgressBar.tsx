import React from 'react';
import { StyleSheet } from 'react-native';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { Slider } from '@sharcoux/slider';

import { useNoxSetting } from '@stores/useApp';

export default () => {
  const { position, duration } = useProgress(200);
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <Slider
      style={styles.progressBar}
      value={position}
      minimumValue={0}
      maximumValue={duration}
      thumbTintColor={
        playerStyle.progressThumbImage
          ? undefined
          : playerStyle.customColors.progressThumbTintColor
      }
      minimumTrackTintColor={
        playerStyle.customColors.progressMinimumTrackTintColor
      }
      maximumTrackTintColor={
        playerStyle.customColors.progressMaximumTrackTintColor
      }
      onSlidingComplete={TrackPlayer.seekTo}
      thumbImage={
        playerStyle.progressThumbImage
          ? { uri: playerStyle.progressThumbImage }
          : undefined
      }
      thumbSize={playerStyle.progressThumbImage ? 40 : undefined}
      thumbStyle={{
        backgroundColor: playerStyle.progressThumbImage
          ? 'transparent'
          : playerStyle.colors.primary,
      }}
      maxTrackStyle={styles.transparent}
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
