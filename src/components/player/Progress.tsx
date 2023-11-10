import { Slider } from '@sharcoux/slider';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { ProgressBar } from 'react-native-paper';
import { useStore } from 'zustand';

import { useNoxSetting } from '@hooks/useSetting';
import { seconds2MMSS as formatSeconds } from '@utils/Utils';
import appStore from '@stores/appStore';

export const Progress: React.FC<{ live?: boolean }> = ({ live }) => {
  const { position, duration } = useProgress();
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
      <View style={styles.progressContainer}>
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
        <ProgressBar
          progress={fetchProgress / 100}
          color={playerStyle.customColors.progressMaximumTrackTintColor}
          style={styles.progressBarDouble}
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
  },
  progressBar: {
    width: '100%',
    marginTop: 10,
    flexDirection: 'row',
    zIndex: 2,
  },
  progressBarDouble: {
    position: 'absolute',
    top: -14,
    alignSelf: 'center',
    backgroundColor: 'grey',
    borderRadius: 5,
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
  transparent: { backgroundColor: 'transparent' },
});
