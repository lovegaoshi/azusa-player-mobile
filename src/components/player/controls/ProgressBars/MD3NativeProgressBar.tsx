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
  const waveThickness = useSharedValue(6);

  const unbufferedColor = useMemo(
    () => colord(playerStyle.colors.primaryContainer).alpha(0.5).toRgbString(),
    [playerStyle.colors.primaryContainer],
  );

  useEffect(() => {
    waveHeight.value = withTiming(immediateShowPause ? 0 : 8, {
      duration: 200,
    });
  }, [immediateShowPause]);

  const onDragStateChange = useMemo(
    () => (v: boolean) => {
      'worklet';
      scheduleOnRN(v ? enterSliding : exitSliding);
      waveThickness.value = withTiming(v ? 20 : 6, { duration: 200 });
      const actualWaveHeight = immediateShowPause ? 0 : 8;
      waveHeight.value = withTiming(v ? 0 : actualWaveHeight, {
        duration: 200,
      });
    },
    [enterSliding, exitSliding],
  );
  const onValueChangeFinished = useMemo(
    () => (v: number) => {
      'worklet';
      scheduleOnRN(TPSeek, v * duration);
    },
    [duration],
  );
  const onValueChangeMemo = useMemo(
    () => (v: number) => {
      'worklet';
      onValueChange && scheduleOnRN(onValueChange, v);
    },
    [onValueChange],
  );

  return (
    <Slider
      style={[styles.progressBar, style]}
      bufferedValue={fetchProgress / 100}
      colors={{
        activeTrackColor: playerStyle.colors.primary,
        thumbColor: playerStyle.colors.primary,
        inactiveTrackColor: unbufferedColor,
        bufferedTrackColor: playerStyle.colors.primaryContainer,
      }}
      value={position / duration || 0}
      onValueChange={onValueChangeMemo}
      onDragStateChange={onDragStateChange}
      enabled={enabled}
      onValueChangeFinished={onValueChangeFinished}
      waveHeight={waveHeight}
      waveLength={35}
      waveDirection="tail"
      trackThickness={waveThickness}
      waveThickness={waveThickness}
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
