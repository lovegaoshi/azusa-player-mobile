import React from 'react';
import { StyleSheet, View } from 'react-native';
import { usePlaybackState } from 'react-native-track-player';

import { PlaybackError } from './PlaybackError';
import { PlayPauseButton } from './PlayPauseButton';
import ThumbsUpButton from './ThumbsUpButton';
import PlayerModeButton from './PlayerModeButton';
import usePlayerControls from './usePlayerControls';
import LottieButton from '../buttons/LottieButton';

export const PlayerControls: React.FC = () => {
  const { performSkipToNext, performSkipToPrevious } = usePlayerControls();
  const playback = usePlaybackState();

  return (
    <View style={styles.container}>
      {'error' in playback ? (
        <PlaybackError error={playback.error.message} />
      ) : (
        <></>
      )}

      <View style={styles.row}>
        <PlayerModeButton />
        <LottieButton
          src={require('@assets/lottie/skip-backwards.json')}
          size={40}
          onPress={performSkipToPrevious}
          strokes={['Line', 'Triange', 'Triange  2']}
        />
        <View style={styles.btnSpacer} />
        <PlayPauseButton state={playback.state} />
        <View style={styles.btnSpacer} />
        <LottieButton
          src={require('@assets/lottie/skip-forwards.json')}
          size={40}
          onPress={performSkipToNext}
          strokes={['Line', 'Triangle 1', 'Triangle 2']}
        />
        <ThumbsUpButton />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSpacer: { width: 6 },
});
