import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import TrackPlayer, {
  State,
  usePlayWhenReady,
} from 'react-native-track-player';

import { useDebouncedValue } from 'hooks';
import { useNoxSetting } from '@hooks/useSetting';
import LottieButtonAnimated from '../buttons/LottieButtonAnimated';
import { fadePause } from '@utils/RNTPUtils';

interface Props {
  state: State | undefined;
  iconSize?: number;
}
export const PlayPauseButton: React.FC<Props> = ({ state, iconSize = 50 }) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const playWhenReady = usePlayWhenReady();
  const isLoading = useDebouncedValue(
    state === State.Loading, // || state === State.Buffering
    250
  );

  const isErrored = state === State.Error;
  const isEnded = state === State.Ended;
  const showPause = playWhenReady && !(isErrored || isEnded);
  const showBuffering = isErrored || (playWhenReady && isLoading);
  const iconContainerStyle = { width: iconSize + 16, height: iconSize + 16 };

  if (showBuffering) {
    return playerStyle.loadingIcon ? (
      <Image
        source={{ uri: playerStyle.loadingIcon }}
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
      onPress={showPause ? fadePause : () => TrackPlayer.play()}
      clicked={!showPause}
      strokes={['Play', 'Play 2', 'Pause', 'Pause 3']}
      pressableStyle={{
        backgroundColor: playerStyle.colors.onPrimary,
      }}
    />
  );
};

const styles = StyleSheet.create({
  LoadingIconStyle: {
    marginTop: 0,
  },
});
