import React from 'react';
import { View, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
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
import PlayerControls from '../player/controls/PlayerProgressControls';
import Lrc from './Lrc';

const SnapToRatio = 0.15;

export default () => {
  const [lrcVisible, setLrcVisible] = React.useState(false);
  const { width, height } = Dimensions.get('window');
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

  const lrcOpacity = useDerivedValue(() => 1 - artworkOpacity.value);

  const dragPlayerHeight = (translationY: number) => {
    'worklet';
    const newHeight = initHeight.value - translationY;
    miniplayerHeight.value = Math.max(
      MinPlayerHeight,
      Math.min(newHeight, height),
    );
  };

  const expand = () => {
    'worklet';
    miniplayerHeight.value = withTiming(height, { duration: 500 });
    artworkOpacity.value = withTiming(1);
  };
  const collapse = () => {
    'worklet';
    miniplayerHeight.value = withTiming(MinPlayerHeight, { duration: 500 });
    artworkOpacity.value = withTiming(1);
    runOnJS(setLrcVisible)(false);
  };
  const onArtworkPress = () => {
    if (artworkOpacity.value === 1) {
      return (artworkOpacity.value = withTiming(0, { duration: 100 }, () => {
        runOnJS(setLrcVisible)(true);
      }));
    }
    if (artworkOpacity.value === 0) {
      setLrcVisible(false);
      return (artworkOpacity.value = withTiming(1, { duration: 100 }));
    }
  };

  const snapPlayerHeight = (translationY: number) => {
    'worklet';
    if (translationY > height * SnapToRatio) {
      return collapse();
    }
    if (translationY < -height * SnapToRatio) {
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

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: miniplayerHeight.value,
    };
  });
  return (
    <GestureDetector
      gesture={lrcVisible ? Gesture.Manual() : scrollDragGesture}
    >
      <Animated.View style={[{ width: '100%', paddingTop: 5 }, animatedStyle]}>
        <View style={[styles.rowView, { paddingTop: 5 }]}>
          <PlayerTopInfo opacity={opacityVisible} collapse={collapse} />
          <TrackAlbumArt
            miniplayerHeight={miniplayerHeight}
            opacity={artworkOpacity}
            onPress={onArtworkPress}
            expand={expand}
          />
          <MiniControls miniplayerHeight={miniplayerHeight} expand={expand} />
        </View>
        <Lrc
          visible={lrcVisible}
          opacity={lrcOpacity}
          onPress={onArtworkPress}
        />
        <TrackInfo
          opacity={opacityVisible}
          artworkOpacity={artworkOpacity}
          style={{ width: '100%', top: width + 28 }}
        />
        <PlayerControls
          opacity={opacityVisible}
          style={{ width: '100%', top: width + 28 }}
        />
      </Animated.View>
    </GestureDetector>
  );
};
