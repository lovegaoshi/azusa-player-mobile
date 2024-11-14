import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import MiniControls from './MiniControls';
import { MinPlayerHeight } from './Constants';
import TrackAlbumArt from './Artwork';
import PlayerTopInfo from './PlayerTopInfo';
import { styles } from '../style';
import TrackInfo from './TrackInfo';

const SnapToRatio = 0.15;

export default () => {
  const { width, height } = Dimensions.get('window');
  const PlayerHeight = height - MinPlayerHeight;

  const miniplayerHeight = useSharedValue(MinPlayerHeight);
  const artworkOpacity = useSharedValue(1);
  const initHeight = useSharedValue(0);

  const opacityVisible = useDerivedValue(() => {
    if (miniplayerHeight.value > width) {
      return Math.min(
        1,
        ((miniplayerHeight.value - width) / (height - width)) * 2,
      );
    }
    return 0;
  });

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
    artworkOpacity.value = withTiming(1);
  };
  const collapse = () => {
    'worklet';
    miniplayerHeight.value = withTiming(MinPlayerHeight, { duration: 500 });
    artworkOpacity.value = withTiming(1);
  };
  const onArtworkPress = () => {
    'worklet';
    if (artworkOpacity.value === 1) {
      return (artworkOpacity.value = withTiming(0, { duration: 100 }));
    }
    if (artworkOpacity.value === 0) {
      return (artworkOpacity.value = withTiming(1, { duration: 100 }));
    }
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
          <PlayerTopInfo opacity={opacityVisible} collapse={collapse} />
          <TrackAlbumArt
            miniplayerHeight={miniplayerHeight}
            opacity={artworkOpacity}
            onPress={onArtworkPress}
            expand={expand}
          />
          <MiniControls miniplayerHeight={miniplayerHeight} />
        </View>
        <TrackInfo opacity={opacityVisible} />
      </Animated.View>
    </GestureDetector>
  );
};
