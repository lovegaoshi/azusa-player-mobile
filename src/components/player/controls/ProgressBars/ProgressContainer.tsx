import React from 'react';
import { StyleSheet, View } from 'react-native';

import ProgressWavy from './ProgressWavy';
import ProgressBarAPM from './ProgressBar';
import ProgressFetchBar from './ProgressFetchBar';
import NativeProgressBarAPM from './NativeProgressBar';
import NativeProgressFetchBar from './NativeProgressFetchBar';
import { useNoxSetting } from '@stores/useApp';
import { isAndroid } from '@utils/RNUtils';
import { ProgressBarContainerProps } from './ProgressBarProps';

const Progress = (p: ProgressBarContainerProps) => (
  <View style={styles.progressContainer}>
    <ProgressBarAPM {...p} />
    <ProgressFetchBar />
  </View>
);

const NativeProgress = (p: ProgressBarContainerProps) => (
  <View
    style={
      isAndroid
        ? styles.progressContainerAndroidNative
        : styles.progressContainer
    }
  >
    <NativeProgressBarAPM {...p} />
    <NativeProgressFetchBar />
  </View>
);

export default function ProgressContainer(p: ProgressBarContainerProps) {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  return (
    <View>
      <ProgressWavy />
      {playerSetting.nativeBottomTab ? (
        <NativeProgress {...p} />
      ) : (
        <Progress {...p} />
      )}
    </View>
  );
}

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
