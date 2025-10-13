import React from 'react';
import { StyleSheet } from 'react-native';
import { useStore } from 'zustand';
import Slider from '@react-native-community/slider';

import { useNoxSetting } from '@stores/useApp';
import appStore from '@stores/appStore';

export default function NativeProgressFetchBar() {
  const fetchProgress = useStore(appStore, state => state.fetchProgress);
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <Slider
      value={fetchProgress}
      minimumValue={0}
      maximumValue={100}
      minimumTrackTintColor={playerStyle.colors.secondary}
      style={[styles.progressBarDouble]}
      thumbImage={require('@assets/icons/1x1.png')}
      sliderThickness={10}
      sliderCornerRoundness={100}
    />
  );
}

const styles = StyleSheet.create({
  progressBarDouble: {
    width: '100%',
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    borderRadius: 5,
  },
});
