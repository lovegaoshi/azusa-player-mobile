import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import TrackPlayer, {
  State,
  usePlayWhenReady,
} from 'react-native-track-player';
import { useDebouncedValue } from '../../hooks';

export const PlayPauseButton: React.FC<{
  state: State | undefined;
}> = ({ state }) => {
  const playWhenReady = usePlayWhenReady();
  const isLoading = useDebouncedValue(
    state === State.Loading, // || state === State.Buffering
    250
  );

  const isErrored = state === State.Error;
  const isEnded = state === State.Ended;
  const showPause = playWhenReady && !(isErrored || isEnded);
  const showBuffering = playWhenReady && isLoading;
  return showBuffering ? (
    <ActivityIndicator size={50} />
  ) : (
    <IconButton
      icon={showPause ? 'pause' : 'play'}
      onPress={showPause ? TrackPlayer.pause : TrackPlayer.play}
      mode="contained"
      size={50}
    />
  );
};

const styles = StyleSheet.create({
  playPause: {
    width: 120,
    textAlign: 'center',
  },
  statusContainer: {
    height: 40,
    width: 120,
    marginTop: 20,
    marginBottom: 60,
  },
});
