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
  useDerivedValue,
} from 'react-native-reanimated';

const SCROLLBAR_HIDE_TIMEOUT = 3000;
const SCROLLBAR_ANIM_TIME = 300;

interface Props {
  children: JSX.Element | JSX.Element[];
  scrollViewReference: RefObject<FlashList<NoxMedia.Song>>;
  style?: StyleProp<ViewStyle>;
  scrollViewHeight: SharedValue<number>;
  scrollPosition: SharedValue<number>;
  barHeight?: number;
  contentHeight: SharedValue<number>;
  scrollBarHideTimeout?: number;
  scrollBarAnimTime?: number;
}

export default function CustomScrollView({
  children,
  scrollViewReference,
  style,
  scrollViewHeight,
  scrollPosition,
  barHeight = 0.2,
  contentHeight,
  scrollBarAnimTime = SCROLLBAR_ANIM_TIME,
  scrollBarHideTimeout = SCROLLBAR_HIDE_TIMEOUT,
}: Props) {
  const scrollTimeoutId = useRef<NodeJS.Timeout>();
  const scrollIndicatorOpacity = useSharedValue(0);
  const startScrollY = useSharedValue(0);
  const getBarHeight = () => {
    'worklet';
    return barHeight > 1 ? barHeight : scrollViewHeight.value * barHeight;
  };
  const scrollBarY = useDerivedValue(() =>
    interpolate(
      scrollPosition.value,
      [0, 1],
      [0, scrollViewHeight.value - getBarHeight()],
      Extrapolation.CLAMP,
    ),
  );

  const scrollTimingAnimConfig = {
    duration: scrollBarAnimTime,
    easing: Easing.linear,
  };

  const createScrollHideTimeout = (timeout: number) => {
    return setTimeout(() => {
      scrollIndicatorOpacity.value = 0;
    }, timeout);
  };

  const resetHideTimeout = (timeout = scrollBarHideTimeout) => {
    scrollIndicatorOpacity.value = 1;
    clearTimeout(scrollTimeoutId.current);
    scrollTimeoutId.current = createScrollHideTimeout(timeout);
  };

  useAnimatedReaction(
    () => scrollPosition.value,
    () => runOnJS(resetHideTimeout)(),
  );

  const scrollByTranslationY = (offset: number) => {
    scrollViewReference.current?.scrollToOffset({
      offset,
      animated: false,
    });
  };

  const scrollDragGesture = Gesture.Pan()
    .onBegin(e => {
      runOnJS(resetHideTimeout)();
      console.log('start', e.y, scrollViewHeight.value, scrollPosition.value);
      startScrollY.value = e.y + scrollBarY.value;
    })
    .onChange(e => {
      // the actual thumb range is half bar size - height - half bar size
      // and this gets intrapolated to 0 - 1 for scrollToPercent
      const halfBar = getBarHeight() / 2;

      const clampedScrollToPercent = interpolate(
        startScrollY.value + e.translationY,
        [halfBar, scrollViewHeight.value - halfBar],
        [0, 1],
        Extrapolation.CLAMP,
      );
      console.log(clampedScrollToPercent);
      runOnJS(scrollByTranslationY)(
        clampedScrollToPercent * contentHeight.value,
      );
    });

  const scrollBarDynamicStyle = useAnimatedStyle(() => {
    const barHeight = getBarHeight();
    return {
      opacity: withTiming(scrollIndicatorOpacity.value, scrollTimingAnimConfig),
      height: barHeight,
      top: scrollBarY.value,
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
    width: 65,
    borderRadius: 0,
    zIndex: 10,
  },
});
