import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useProgress } from 'react-native-track-player';
import { ProgressBar } from 'react-native-paper';
import { useStore } from 'zustand';

import ProgressWavy from './ProgressWavy';
import ProgressBarAPM from './ProgressBar';
import { useNoxSetting } from '@stores/useApp';
import { seconds2MMSS as formatSeconds } from '@utils/Utils';
import appStore from '@stores/appStore';
import { NativeText as Text } from '@components/commonui/ScaledText';

export const Progress: React.FC<{ live?: boolean }> = ({ live }) => {
  const { position, duration } = useProgress(1000, false);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const fetchProgress = useStore(appStore, state => state.fetchProgress);

  const progressTextStyle = [
    styles.labelText,
    {
      color: playerStyle.metaData.darkTheme
        ? 'white'
        : playerStyle.colors.primary,
    },
  ];

  return live ? (
    <View style={styles.liveContainer}>
      <Text style={[styles.liveText, { color: playerStyle.colors.primary }]}>
        Live Stream
      </Text>
    </View>
  ) : (
    <View style={styles.container}>
      <ProgressWavy />
      <View style={styles.progressContainer}>
        <ProgressBarAPM />
        <ProgressBar
          progress={fetchProgress / 100}
          color={playerStyle.colors.secondary}
          fillStyle={{ marginHorizontal: -15 }}
          style={[
            styles.progressBarDouble,
            {
              backgroundColor: playerStyle.colors.secondaryContainer,
            },
          ]}
        />
      </View>
      <View style={[styles.labelContainer, { paddingHorizontal: 10 }]}>
        <Text style={progressTextStyle}>{formatSeconds(position)}</Text>
        <Text style={progressTextStyle}>
          {`-${formatSeconds(Math.max(0, duration - position))}`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  liveContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 28,
  },
  liveText: {
    color: 'white',
    alignSelf: 'center',
    fontSize: 18,
  },
  container: {
    width: '100%',
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: 25,
    marginTop: -22,
  },
  progressBarDouble: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    backgroundColor: 'lightgrey',
    borderRadius: 5,
    height: 2,
  },
  labelContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  labelText: {
    color: 'white',
    fontVariant: ['tabular-nums'],
  },
});
