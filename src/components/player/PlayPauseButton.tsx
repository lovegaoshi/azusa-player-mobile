import React from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import TrackPlayer, {
  State,
  usePlayWhenReady,
} from 'react-native-track-player';

import { useDebouncedValue } from 'hooks';
import { useNoxSetting } from 'hooks/useSetting';

const LoadingIconStyle = {
  width: 78,
  height: 78,
  marginTop: 0,
};

export const PlayPauseButton: React.FC<{
  state: State | undefined;
}> = ({ state }) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const playWhenReady = usePlayWhenReady();
  const isLoading = useDebouncedValue(
    state === State.Loading, // || state === State.Buffering
    250
  );

  const isErrored = state === State.Error;
  const isEnded = state === State.Ended;
  const showPause = playWhenReady && !(isErrored || isEnded);
  const showBuffering = playWhenReady && isLoading;

  if (showBuffering) {
    return playerStyle.loadingIcon ? (
      <Image
        source={{ uri: playerStyle.loadingIcon }}
        style={LoadingIconStyle}
      />
    ) : (
      <ActivityIndicator size={78} />
    );
  }
  return (
    <IconButton
      icon={showPause ? 'pause' : 'play'}
      onPress={showPause ? TrackPlayer.pause : TrackPlayer.play}
      mode={playerStyle.playerControlIconContained}
      size={50}
      style={{ backgroundColor: playerStyle.customColors.btnBackgroundColor }}
    />
  );
};
