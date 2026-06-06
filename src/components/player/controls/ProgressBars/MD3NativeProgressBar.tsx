import React, { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useProgress } from 'react-native-track-player';
import { WavySlider as Slider } from 'expo-wavy-slider';
import { scheduleOnRN } from 'react-native-worklets';
import { useStore } from 'zustand';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { colord } from 'colord';

import { useNoxSetting } from '@stores/useApp';
import { TPSeek } from '@stores/RNObserverStore';
import { ProgressBarProps } from './ProgressBarProps';
import appStore from '@stores/appStore';

const WaveHeight = 8;

export default function SimpleProgressBar({
  style,
  enabled = true,
  progressInterval = 200,
  onValueChange,
}: ProgressBarProps) {
  const { position, duration } = useProgress(progressInterval, false);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const enterSliding = useNoxSetting(state => state.enableMiniProgressSliding);
  const exitSliding = useNoxSetting(state => state.disableMiniProgressSliding);
  const fetchProgress = useStore(appStore, state => state.fetchProgress);
  const immediateShowPause = useNoxSetting(state => state.immediateShowPause);
  const waveHeight = useSharedValue(0);
  const playProgress = position / duration;

  const bufferColor = useMemo(
    () =>
      colord(playerStyle.colors.primaryContainer).darken(0.04).toRgbString(),
    [playerStyle.colors.primaryContainer],
  );

  useEffect(() => {
    waveHeight.value = withTiming(immediateShowPause ? 0 : WaveHeight, {
      duration: 200,
    });
  }, [immediateShowPause]);

  return (
    <Slider
      style={[styles.progressBar, style]}
      bufferedValue={
        playProgress === 1
          ? 0
          : (fetchProgress / 100 - playProgress) / (1 - playProgress) || 0
      }
      colors={{
        // inactiveTrackColor: playerStyle.colors.secondary,
        bufferedTrackColor: bufferColor,
      }}
      value={playProgress || 0}
      onValueChange={v => {
        'worklet';
        onValueChange && scheduleOnRN(onValueChange, v);
      }}
      onDragStateChange={v => {
        'worklet';
        v && scheduleOnRN(v ? enterSliding : exitSliding);
      }}
      enabled={enabled}
      onValueChangeFinished={v => {
        'worklet';
        scheduleOnRN(TPSeek, v * duration);
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
