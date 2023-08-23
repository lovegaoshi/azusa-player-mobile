import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  usePlaybackState,
  useTrackPlayerEvents,
  Event,
} from 'react-native-track-player';
import { IconButton } from 'react-native-paper';

import { PlaybackError } from './PlaybackError';
import { PlayPauseButton } from './PlayPauseButton';
import { useNoxSetting } from '@hooks/useSetting';
import ThumbsUpButton from './ThumbsUpButton';
import PlayerModeButton from './PlayerModeButton';
import usePlayerControls from './usePlayerControls';
import LottieButton from '../buttons/LottieButton';

export const PlayerControls: React.FC = () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  const setCurrentPlayingId = useNoxSetting(state => state.setCurrentPlayingId);
  const { performSkipToNext, performSkipToPrevious } = usePlayerControls();
  const playback = usePlaybackState();

  // HACK:  this shouldnt be here? but where?
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], event => {
    if (event.track && event.track.song)
      setCurrentPlayingId(event.track.song.id);
    else setCurrentPlayingId('');
  });

  useTrackPlayerEvents([Event.PlaybackQueueEnded], () => {
    performSkipToNext();
  });

  useTrackPlayerEvents([Event.RemoteNext], () => {
    performSkipToNext();
  });

  useTrackPlayerEvents([Event.RemotePrevious], () => {
    performSkipToPrevious();
  });

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
