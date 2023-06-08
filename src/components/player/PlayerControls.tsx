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
import { useNoxSetting } from '../../hooks/useSetting';
import ThumbsUpButton from './ThumbsUpButton';
import PlayerModeButton from './PlayerModeButton';
import usePlayerControls from './usePlayerControls';

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
        <IconButton
          icon="skip-previous"
          onPress={performSkipToPrevious}
          mode={playerStyle.playerControlIconContained}
          size={40}
          style={{
            backgroundColor: playerStyle.customColors.btnBackgroundColor,
          }}
        />
        <PlayPauseButton state={playback.state} />
        <IconButton
          icon="skip-next"
          onPress={performSkipToNext}
          mode={playerStyle.playerControlIconContained}
          size={40}
          style={{
            backgroundColor: playerStyle.customColors.btnBackgroundColor,
          }}
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
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
