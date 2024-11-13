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

const ScreenHeight = Dimensions.get('window').height;
const MinPlayerHeight = 50;
const SnapToRatio = 0.15;

// snapshot: snapping the miniplayer to top or bottom
export default () => {
  const miniplayerHeight = useSharedValue(MinPlayerHeight);
  const initHeight = useSharedValue(0);

  const dragPlayerHeight = (translationY: number) => {
    'worklet';
    const newHeight = initHeight.value - translationY;
    miniplayerHeight.value = Math.max(
      MinPlayerHeight,
      Math.min(newHeight, ScreenHeight),
    );
  };

  const snapPlayerHeight = (translationY: number) => {
    'worklet';
    if (translationY > ScreenHeight * SnapToRatio) {
      return (miniplayerHeight.value = withTiming(MinPlayerHeight));
    }
    if (translationY < -ScreenHeight * SnapToRatio) {
      return (miniplayerHeight.value = withTiming(ScreenHeight));
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
      <Animated.View
        style={[{ backgroundColor: 'red', width: '100%' }, miniplayerStyle]}
      ></Animated.View>
    </GestureDetector>
  );
};
