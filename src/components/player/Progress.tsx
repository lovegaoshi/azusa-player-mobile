import Slider from '@react-native-community/slider';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { useNoxSetting } from '../../hooks/useSetting';

export const Progress: React.FC<{ live?: boolean }> = ({ live }) => {
  const { position, duration } = useProgress();
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return live ? (
    <View style={styles.liveContainer}>
      <Text style={styles.liveText}>Live Stream</Text>
    </View>
  ) : (
    <>
      <Slider
        style={styles.container}
        value={position}
        minimumValue={0}
        maximumValue={duration}
        thumbTintColor={playerStyle.customColors.progressThumbTintColor}
        minimumTrackTintColor={
          playerStyle.customColors.progressMinimumTrackTintColor
        }
        maximumTrackTintColor={
          playerStyle.customColors.progressMaximumTrackTintColor
        }
        onSlidingComplete={TrackPlayer.seekTo}
      />
      <View style={[styles.labelContainer, { paddingHorizontal: 10 }]}>
        <Text style={styles.labelText}>{formatSeconds(position)}</Text>
        <Text style={styles.labelText}>
          {formatSeconds(Math.max(0, duration - position))}
        </Text>
      </View>
    </>
  );
};

const formatSeconds = (time: number) =>
  new Date(time * 1000).toISOString().slice(14, 19);

const styles = StyleSheet.create({
  liveContainer: {
    height: 100,
    alignItems: 'center',
    flexDirection: 'row',
  },
  liveText: {
    color: 'white',
    alignSelf: 'center',
    fontSize: 18,
  },
  container: {
    width: '100%',
    marginTop: 10,
    flexDirection: 'row',
  },
  labelContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelText: {
    color: 'white',
    fontVariant: ['tabular-nums'],
  },
});
