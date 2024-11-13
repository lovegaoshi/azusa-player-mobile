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

// snapshot: draggable "miniplayer" that changes height on drag
export default () => {
  const miniplayerHeight = useSharedValue(50);
  const initHeight = useSharedValue(0);

  const calcPlayerHeight = (translationY: number) => {
    'worklet';
    const newHeight = initHeight.value - translationY;
    return Math.max(50, Math.min(newHeight, ScreenHeight));
  };

  const scrollDragGesture = Gesture.Pan()
    .onStart(e => {
      console.log('start', e);
      initHeight.value = miniplayerHeight.value;
    })
    .onChange(e => (miniplayerHeight.value = calcPlayerHeight(e.translationY)))
    .onEnd(e => console.log('end', e.translationY));

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
