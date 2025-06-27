import React, { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MiniControls from './MiniControls';
import { MinPlayerHeight } from './Constants';
import TrackAlbumArt from './Artwork';
import PlayerTopInfo from './PlayerTopInfo';
import { styles } from '../style';
import TrackInfo from './TrackInfo';
import PlayerControls from '../player/controls/PlayerProgressControls';
import Lrc from './Lrc';
import ProgressBar from './ProgressBar';
import { useNoxSetting } from '@stores/useApp';
import { useMiniplayerHeight } from '@contexts/MiniPlayerHeightContext';

const SnapToRatio = 0.15;

export default () => {
  const [lrcVisible, setLrcVisible] = React.useState(false);
  const insets = useSafeAreaInsets();
  const dim = Dimensions.get('window');
  const width = dim.width;
  const height = dim.height + insets.top + insets.bottom;
  const miniplayerHeight = useMiniplayerHeight();
  const artworkOpacity = useSharedValue(1);
  const initHeight = useSharedValue(0);
  const expandCounter = useNoxSetting(state => state.expandCounter);

  const miniplayerVisibleCounter = useNoxSetting(
    state => state.miniplayerVisibleCounter,
  );
  const sliding = useNoxSetting(state => state.miniProgressSliding);

  const opacityVisible = useDerivedValue(() => {
    const opacityLevel = width + 50;
    if (miniplayerHeight.value > opacityLevel) {
      return Math.min(
        1,
        ((miniplayerHeight.value - opacityLevel) / (height - width)) * 2,
      );
    }
    return 0;
  });

  const lrcOpacity = useDerivedValue(() => 1 - artworkOpacity.value);

  const dragPlayerHeight = (translationY: number) => {
    'worklet';
    const newHeight = initHeight.value - translationY;
    miniplayerHeight.value = Math.max(0, Math.min(newHeight, height));
  };

  const transitionHeight = (toHeight: number, animation = true) => {
    'worklet';
    miniplayerHeight.value = animation
      ? withTiming(toHeight, {
          duration: 250,
          easing: Easing.out(Easing.exp),
        })
      : toHeight;
    artworkOpacity.value = withTiming(1);
  };

  const expand = (animation = true, toHeight = -1) => {
    'worklet';
    if (toHeight === -1) {
      toHeight = height;
    }
    transitionHeight(toHeight, animation);
  };

  const collapse = (animation = true, toHeight = -1) => {
    'worklet';
    if (toHeight === -1) {
      toHeight = MinPlayerHeight;
    }
    transitionHeight(toHeight, animation);
    runOnJS(setLrcVisible)(false);
  };

  const hide = (animation = true) => {
    'worklet';
    transitionHeight(0, animation);
  };

  const show = (animation = true) => {
    'worklet';
    miniplayerHeight.value === 0 &&
      transitionHeight(MinPlayerHeight, animation);
  };

  const onArtworkPress = () => {
    if (artworkOpacity.value === 1) {
      artworkOpacity.value = withTiming(0, { duration: 100 }, () => {
        runOnJS(setLrcVisible)(true);
      });
      return;
    }
    if (artworkOpacity.value === 0) {
      setLrcVisible(false);
      artworkOpacity.value = withTiming(1, { duration: 100 });
      return;
    }
  };

  const snapPlayerHeight = (translationY: number) => {
    'worklet';
    if (miniplayerHeight.value < MinPlayerHeight * 0.7) {
      return hide();
    }
    if (translationY > height * SnapToRatio) {
      return collapse();
    }
    if (translationY < -height * SnapToRatio) {
      return expand();
    }
    miniplayerHeight.value = withTiming(initHeight.value, {
      duration: 250,
    });
    return;
  };

  const scrollDragGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-5, 5])
        .onStart(() => (initHeight.value = miniplayerHeight.value))
        .onChange(e => dragPlayerHeight(e.translationY))
        .onEnd(e => snapPlayerHeight(e.translationY)),
    [],
  );

  const disabledGesture = React.useMemo(() => Gesture.Manual(), []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: miniplayerHeight.value,
      opacity: Math.min(1, miniplayerHeight.value / MinPlayerHeight),
    };
  });

  useEffect(() => {
    if (expandCounter === 0) {
      setTimeout(() => expand(), 50);
      return;
    }
    expand();
  }, [expandCounter]);

  useEffect(() => {
    show();
  }, [miniplayerVisibleCounter]);

  useEffect(() => {
    useNoxSetting.setState({ collapse, expand });
  }, []);

  return (
    <GestureDetector
      gesture={lrcVisible || sliding ? disabledGesture : scrollDragGesture}
    >
      <Animated.View style={[{ width: '100%' }, animatedStyle]}>
        <View style={styles.rowView}>
          <PlayerTopInfo opacity={opacityVisible} collapse={collapse} />
          <TrackAlbumArt
            miniplayerHeight={miniplayerHeight}
            opacity={artworkOpacity}
            onPress={onArtworkPress}
            expand={expand}
          />
          <MiniControls miniplayerHeight={miniplayerHeight} expand={expand} />
        </View>
        <ProgressBar miniplayerHeight={miniplayerHeight} />
        <Lrc
          visible={lrcVisible}
          opacity={lrcOpacity}
          onPress={onArtworkPress}
        />
        <View style={{ height: insets.top }} />
        <TrackInfo
          opacity={opacityVisible}
          artworkOpacity={artworkOpacity}
          style={{ width: '100%', top: width + 33 }}
        />
        <PlayerControls
          opacity={opacityVisible}
          style={{ width: '100%', top: width + 28 }}
        />
      </Animated.View>
    </GestureDetector>
  );
};
