import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useProgress } from 'react-native-track-player';
import { WavySlider as Slider } from 'expo-wavy-slider';
import { scheduleOnRN } from 'react-native-worklets';
import { useStore } from 'zustand';
import { useSharedValue, withTiming } from 'react-native-reanimated';

import { useNoxSetting } from '@stores/useApp';
import { TPSeek } from '@stores/RNObserverStore';
import { ProgressBarProps } from './ProgressBarProps';
import appStore from '@stores/appStore';
import usePlaybackState from '@hooks/usePlaybackState';

const WaveHeight = 8;

export default function SimpleProgressBar({
  style,
  enabled = true,
  progressInterval = 200,
  onValueChange,
}: ProgressBarProps) {
  const { position, duration } = useProgress(progressInterval, false);
  const enterSliding = useNoxSetting(state => state.enableMiniProgressSliding);
  const exitSliding = useNoxSetting(state => state.disableMiniProgressSliding);
  const fetchProgress = useStore(appStore, state => state.fetchProgress);
  const { showPause, showBuffering } = usePlaybackState();
  const waveHeight = useSharedValue(0);

  const playProgress = duration === 0 ? 0 : position / duration;
  const bufferProgress = fetchProgress / 100;

  useEffect(() => {
    'worklet';
    waveHeight.value = withTiming(showPause || showBuffering ? WaveHeight : 0, {
      duration: 200,
    });
  }, [showPause, showBuffering]);

  return (
    <Slider
      style={[styles.progressBar, style]}
      bufferedValue={(bufferProgress - playProgress) / (1 - playProgress)}
      value={playProgress}
      onValueChange={v => {
        'worklet';
        onValueChange && scheduleOnRN(onValueChange, v);
      }}
      onDragStateChange={v => {
        'worklet';
        v && scheduleOnRN(enterSliding);
      }}
      enabled={enabled}
      onValueChangeFinished={v => {
        'worklet';
        scheduleOnRN(TPSeek, v * duration);
        scheduleOnRN(exitSliding);
      }}
      waveHeight={waveHeight}
      waveLength={35}
      waveDirection="tail"
      trackThickness={8}
    />
  );
}

const styles = StyleSheet.create({
  progressBar: {
    alignSelf: 'center',
    width: '90%',
    marginTop: 10,
    flexDirection: 'row',
    zIndex: 2,
    height: 30,
  },
  transparent: { backgroundColor: 'transparent' },
});
