import { Slider } from '@sharcoux/slider';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { useNoxSetting } from 'hooks/useSetting';
import { seconds2MMSS as formatSeconds } from '@utils/Utils';

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
    paddingHorizontal: 15,
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
