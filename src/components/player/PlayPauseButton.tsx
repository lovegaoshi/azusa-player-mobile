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
  const showBuffering = isErrored || (playWhenReady && isLoading);

  if (showBuffering) {
    return playerStyle.loadingIcon ? (
      <Image
        source={{ uri: playerStyle.loadingIcon }}
        style={styles.LoadingIconStyle}
      />
    ) : (
      <ActivityIndicator size={45} style={styles.activityIndicator} />
    );
  }
  return (
    <LottieButtonAnimated
      src={require('@assets/lottie/PauseGoAndBack.json')}
      size={50}
      onPress={showPause ? fadePause : () => TrackPlayer.play()}
      clicked={!showPause}
      strokes={['Play', 'Play 2', 'Pause', 'Pause 3']}
    />
  );
};

const styles = StyleSheet.create({
  LoadingIconStyle: {
    width: 66,
    height: 66,
    marginTop: 0,
  },
  activityIndicator: {
    width: 66,
    height: 66,
  },
});
