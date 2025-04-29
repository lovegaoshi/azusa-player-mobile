import React from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ActivityIndicator } from 'react-native-paper';
import TrackPlayer from 'react-native-track-player';

import usePlaybackState from '@hooks/usePlaybackState';
import { useNoxSetting } from '@stores/useApp';
import LottieButtonAnimated from '@components/buttons/LottieButtonAnimated';
import { fadePause } from '@utils/RNTPUtils';

interface Props {
  iconSize?: number;
}
export const PlayPauseButton: React.FC<Props> = ({ iconSize = 50 }) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const { showPause, showBuffering } = usePlaybackState();
  const iconContainerStyle = { width: iconSize + 16, height: iconSize + 16 };

  if (showBuffering) {
    return playerStyle.loadingIcon ? (
      <Image
        source={{ uri: playerStyle.loadingIcon, ...iconContainerStyle }}
        style={[styles.LoadingIconStyle, iconContainerStyle]}
      />
    ) : (
      <ActivityIndicator size={iconSize - 5} style={iconContainerStyle} />
    );
  }
  return (
    <LottieButtonAnimated
      src={require('@assets/lottie/PauseGoAndBack.json')}
      size={iconSize}
      onPress={showPause ? fadePause : TrackPlayer.play}
      clicked={!showPause}
      strokes={['Play', 'Play 2', 'Pause', 'Pause 3']}
    />
  );
};

const styles = StyleSheet.create({
  LoadingIconStyle: {
    marginTop: 0,
  },
});
