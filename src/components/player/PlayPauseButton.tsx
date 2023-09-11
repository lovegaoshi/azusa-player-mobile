import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { ActivityIndicator, IconButton } from 'react-native-paper';
import TrackPlayer, {
  State,
  usePlayWhenReady,
} from 'react-native-track-player';

import { useDebouncedValue } from 'hooks';
import { useNoxSetting } from '@hooks/useSetting';
import LottieButtonAnimated from '../buttons/LottieButtonAnimated';
import appStore, { getR128Gain } from '@stores/appStore';

const getAppStoreState = appStore.getState;

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

  const onPause = () =>
    TrackPlayer.fadeOutPause(getAppStoreState().fadeIntervalMs);

  const onPlay = () => {
    const { fadeIntervalMs } = getAppStoreState();
    TrackPlayer.play();
    TrackPlayer.setAnimatedVolume({
      volume: getR128Gain() || 1,
      duration: fadeIntervalMs,
    });
  };

  if (showBuffering) {
    return playerStyle.loadingIcon ? (
      <Image
        source={{ uri: playerStyle.loadingIcon }}
        style={styles.LoadingIconStyle}
      />
    ) : (
      <ActivityIndicator size={55} style={styles.activityIndicator} />
    );
  }
  return (
    <LottieButtonAnimated
      src={require('@assets/lottie/PauseGoAndBack.json')}
      size={50}
      onPress={showPause ? onPause : onPlay}
      clicked={!showPause}
      strokes={['Play', 'Play 2', 'Pause', 'Pause 3']}
    />
  );
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

const styles = StyleSheet.create({
  LoadingIconStyle: {
    width: 78,
    height: 78,
    marginTop: 0,
  },
  activityIndicator: {
    width: 66,
    height: 66,
  },
});
