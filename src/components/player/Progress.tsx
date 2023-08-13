import { Slider } from '@sharcoux/slider';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TrackPlayer, {
  RepeatMode,
  useProgress,
} from 'react-native-track-player';

import { useNoxSetting } from '@hooks/useSetting';
import { seconds2MMSS as formatSeconds } from '@utils/Utils';
import { getABRepeatRaw } from '@stores/appStore';
import usePlayerControls from './usePlayerControls';

export const Progress: React.FC<{ live?: boolean }> = ({ live }) => {
  const { position, duration } = useProgress();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const abRepeat = useRef([0, 1]);
  const bRepeatDuration = useRef(99999);
  const { performSkipToNext } = usePlayerControls();

  useEffect(() => {
    if (!currentPlayingId) return;
    const newBRepeat = getABRepeatRaw(currentPlayingId);
    abRepeat.current = newBRepeat;
    bRepeatDuration.current = newBRepeat[1] * duration;
  }, [duration]);

  useEffect(() => {
    if (abRepeat.current[1] === 1) return;
    if (position > bRepeatDuration.current) {
      TrackPlayer.getRepeatMode().then(repeatMode => {
        switch (repeatMode) {
          case RepeatMode.Track:
            TrackPlayer.seekTo(duration * abRepeat.current[0]);
            break;
          default:
            performSkipToNext();
        }
      });
    }
  }, [position]);

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
