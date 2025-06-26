import React from 'react';
import { StyleSheet, View } from 'react-native';

import ProgressWavy from './ProgressWavy';
import ProgressBarAPM from './ProgressBar';
import ProgressFetchBar from './ProgressFetchBar';
import NativeProgressBarAPM from './NativeProgressBar';
import NativeProgressFetchBar from './NativeProgressFetchBar';
import { useNoxSetting } from '@stores/useApp';

const Progress = () => (
  <View style={styles.progressContainer}>
    <ProgressBarAPM />
    <ProgressFetchBar />
  </View>
);

const NativeProgress = () => (
  <View style={styles.progressContainerAndroidNative}>
    <NativeProgressBarAPM />
    <NativeProgressFetchBar />
  </View>
);

export default () => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  return (
    <View>
      <ProgressWavy />
      {playerSetting.nativeBottomTab ? <NativeProgress /> : <Progress />}
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    width: '100%',
    // for android native bar, set this to 0
    paddingHorizontal: 25,
    marginTop: -22,
  },
  progressContainerAndroidNative: {
    width: '100%',
    marginTop: -22,
  },
});
