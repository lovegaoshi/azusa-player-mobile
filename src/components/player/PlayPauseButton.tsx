import React, { useEffect, useRef } from 'react';
import {
  Image,
  StyleSheet,
  Animated,
  View,
  Easing,
  Pressable,
} from 'react-native';
import { ActivityIndicator, IconButton } from 'react-native-paper';
import TrackPlayer, {
  State,
  usePlayWhenReady,
} from 'react-native-track-player';
import LottieView from 'lottie-react-native';

import { useDebouncedValue } from 'hooks';
import { useNoxSetting } from '@hooks/useSetting';

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

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
  const animationProgress = useRef(new Animated.Value(showPause ? 0 : 0.5));

  const onPlay = () => {
    Animated.timing(animationProgress.current, {
      toValue: 1,
      duration: 340,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => animationProgress.current.setValue(0));
    TrackPlayer.play();
  };

  const onPause = () => {
    Animated.timing(animationProgress.current, {
      toValue: 0.5,
      duration: 340,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
    TrackPlayer.pause();
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
    <Pressable
      style={{
        backgroundColor: playerStyle.customColors.btnBackgroundColor,
        width: 66,
        height: 66,
        borderRadius: 66 / 2,
      }}
      onPress={showPause ? onPause : onPlay}
    >
      <AnimatedLottieView
        source={require('@assets/lottie/PauseGoAndBack.json')}
        progress={animationProgress.current}
        style={{ width: 50, height: 50, marginLeft: 8, marginTop: 8 }}
        colorFilters={[
          { keypath: 'Play 2', color: playerStyle.colors.primary },
          { keypath: 'Play', color: playerStyle.colors.primary },
          { keypath: 'Pause', color: playerStyle.colors.primary },
          { keypath: 'Pause 3', color: playerStyle.colors.primary },
        ]}
      />
    </Pressable>
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
