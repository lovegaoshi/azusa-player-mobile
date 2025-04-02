import { FlashList } from '@shopify/flash-list';
import { RefObject, useRef } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  runOnJS,
  SharedValue,
  interpolate,
  Extrapolation,
  useAnimatedReaction,
} from 'react-native-reanimated';

const SCROLLBAR_HIDE_TIMEOUT = 3000;
const SCROLLBAR_ANIM_TIME = 300;

interface Props {
  children: JSX.Element | JSX.Element[];
  scrollViewReference: RefObject<FlashList<NoxMedia.Song>>;
  style?: StyleProp<ViewStyle>;
  scrollViewHeight: SharedValue<number>;
  scrollBarPosition: SharedValue<number>;
  barHeight?: number;
  contentHeight: SharedValue<number>;
}

export default function CustomScrollView({
  children,
  scrollViewReference,
  style,
  scrollViewHeight,
  scrollBarPosition,
  barHeight = 0.2,
  contentHeight,
}: Props) {
  const scrollTimeoutId = useRef<NodeJS.Timeout>();
  const scrollIndicatorOpacity = useSharedValue(0);
  const getBarHeight = () => {
    'worklet';
    return barHeight > 1 ? barHeight : scrollViewHeight.value * barHeight;
  };

  const scrollTimingAnimConfig = {
    duration: SCROLLBAR_ANIM_TIME,
    easing: Easing.linear,
  };

  const createScrollHideTimeout = (timeout: number) => {
    return setTimeout(() => {
      scrollIndicatorOpacity.value = 0;
    }, timeout);
  };

  const resetHideTimeout = (timeout = SCROLLBAR_HIDE_TIMEOUT) => {
    scrollIndicatorOpacity.value = 1;
    clearTimeout(scrollTimeoutId.current);
    scrollTimeoutId.current = createScrollHideTimeout(timeout);
  };

  useAnimatedReaction(
    () => scrollBarPosition,
    () => runOnJS(resetHideTimeout)(),
  );

  const scrollByTranslationY = (scrollToPercent: number) => {
    scrollViewReference.current?.scrollToOffset({
      offset: contentHeight.value * scrollToPercent,
      animated: false,
    });
  };

  const scrollDragGesture = Gesture.Pan()
    .onBegin(e => runOnJS(resetHideTimeout)())
    .onChange(e => {
      const scrollToPercent =
        (e.y - getBarHeight() / 2) / scrollViewHeight.value +
        scrollBarPosition.value;
      runOnJS(scrollByTranslationY)(scrollToPercent);
    });

  const scrollBarDynamicStyle = useAnimatedStyle(() => {
    const barHeight = getBarHeight();
    return {
      opacity: withTiming(scrollIndicatorOpacity.value, scrollTimingAnimConfig),
      height: barHeight,
      top: interpolate(
        scrollBarPosition.value,
        [0, 1],
        [0, scrollViewHeight.value - barHeight],
        Extrapolation.CLAMP,
      ),
    };
  });

  return (
    <View style={style}>
      <GestureDetector gesture={scrollDragGesture}>
        <Animated.View
          style={[scrollBarDynamicStyle, styles.indicatorStaticStyle]}
        />
      </GestureDetector>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  indicatorStaticStyle: {
    position: 'absolute',
    right: -19,
    backgroundColor: 'rgba(200, 200, 200, 0.45)',
    width: 25,
    borderRadius: 0,
    zIndex: 10,
  },
});
