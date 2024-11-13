import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import MiniControls from './MiniControls';
import { MinPlayerHeight } from './Constants';

const SnapToRatio = 0.15;

// snapshot: snapping the miniplayer to top or bottom
export default () => {
  const PlayerHeight = Dimensions.get('window').height - MinPlayerHeight;

  const miniplayerHeight = useSharedValue(MinPlayerHeight);
  const initHeight = useSharedValue(0);

  const dragPlayerHeight = (translationY: number) => {
    'worklet';
    const newHeight = initHeight.value - translationY;
    miniplayerHeight.value = Math.max(
      MinPlayerHeight,
      Math.min(newHeight, PlayerHeight),
    );
  };

  const snapPlayerHeight = (translationY: number) => {
    'worklet';
    if (translationY > PlayerHeight * SnapToRatio) {
      return (miniplayerHeight.value = withTiming(MinPlayerHeight));
    }
    if (translationY < -PlayerHeight * SnapToRatio) {
      return (miniplayerHeight.value = withTiming(PlayerHeight));
    }
    return (miniplayerHeight.value = withTiming(initHeight.value));
  };

  const scrollDragGesture = Gesture.Pan()
    .onStart(e => (initHeight.value = miniplayerHeight.value))
    .onChange(e => dragPlayerHeight(e.translationY))
    .onEnd(e => snapPlayerHeight(e.translationY));

  const miniplayerStyle = useAnimatedStyle(() => {
    return {
      height: miniplayerHeight.value,
    };
  });
  return (
    <GestureDetector gesture={scrollDragGesture}>
      <Animated.View style={[{ width: '100%' }, miniplayerStyle]}>
        <MiniControls miniplayerHeight={miniplayerHeight} />
      </Animated.View>
    </GestureDetector>
  );
};
