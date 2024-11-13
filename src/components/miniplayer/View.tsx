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
import TrackAlbumArt from './Artwork';
import PlayerTopInfo from './PlayerTopInfo';
import { styles } from '../style';

const SnapToRatio = 0.15;

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

  const expand = () => {
    'worklet';
    miniplayerHeight.value = withTiming(PlayerHeight, { duration: 500 });
  };
  const collapse = () => {
    'worklet';
    miniplayerHeight.value = withTiming(MinPlayerHeight, { duration: 500 });
  };

  const snapPlayerHeight = (translationY: number) => {
    'worklet';
    if (translationY > PlayerHeight * SnapToRatio) {
      return collapse();
    }
    if (translationY < -PlayerHeight * SnapToRatio) {
      return expand();
    }
    return (miniplayerHeight.value = withTiming(initHeight.value, {
      duration: 500,
    }));
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
        style={[{ width: '100%', paddingTop: 5 }, miniplayerStyle]}
      >
        <View style={[styles.rowView, { paddingTop: 5 }]}>
          <PlayerTopInfo
            miniplayerHeight={miniplayerHeight}
            collapse={collapse}
          />
          <TrackAlbumArt miniplayerHeight={miniplayerHeight} />
          <MiniControls miniplayerHeight={miniplayerHeight} />
        </View>
      </Animated.View>
    </GestureDetector>
  );
};
