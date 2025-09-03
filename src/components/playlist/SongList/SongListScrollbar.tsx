import { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  SharedValue,
  interpolate,
  Extrapolation,
  useAnimatedReaction,
  useDerivedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { ScrollProps, LegendProps } from './ScrollBarLegend';

const SCROLLBAR_HIDE_TIMEOUT = 3000;
const SCROLLBAR_ANIM_TIME = 300;

interface Props extends ScrollProps {
  scrollPosition: SharedValue<number>;
  children: JSX.Element | JSX.Element[];
  style?: StyleProp<ViewStyle>;
  scrollViewHeight: SharedValue<number>;
  barHeight?: number;
  contentHeight: SharedValue<number>;
  scrollBarHideTimeout?: number;
  scrollBarAnimTime?: number;
  LegendContent?: (p: LegendProps) => JSX.Element;
}

export default function CustomScrollView({
  children,
  scrollViewReference,
  style,
  scrollViewHeight,
  scrollPosition,
  scrollOffset,
  barHeight = 0.2,
  contentHeight,
  scrollBarAnimTime = SCROLLBAR_ANIM_TIME,
  scrollBarHideTimeout = SCROLLBAR_HIDE_TIMEOUT,
  LegendContent,
}: Props) {
  const scrollTimeoutId = useRef<NodeJS.Timeout | null>(null);
  const [scrollBarVisible, setScrollBarVisible] = useState(false);
  const scrollIndicatorOpacity = useSharedValue(0);
  const startScrollY = useSharedValue(0);
  const barHeightP = useDerivedValue(() => {
    if (contentHeight.value < 2) return 0;
    const minBarHeight =
      barHeight > 1 ? barHeight : scrollViewHeight.value * barHeight;
    return Math.max(
      minBarHeight,
      scrollViewHeight.value *
        (scrollViewHeight.value /
          (scrollViewHeight.value + contentHeight.value)),
    );
  });
  const scrollBarY = useDerivedValue(() =>
    interpolate(
      scrollPosition.value,
      [0, 1],
      [0, scrollViewHeight.value - barHeightP.value],
      Extrapolation.CLAMP,
    ),
  );
  const showLegend = useSharedValue(0);

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
    if (barHeightP.value < scrollViewHeight.value) {
      scrollIndicatorOpacity.value = 1;
      setScrollBarVisible(true);
    }
    scrollTimeoutId.current && clearTimeout(scrollTimeoutId.current);
    scrollTimeoutId.current = createScrollHideTimeout(timeout);
  };

  useAnimatedReaction(
    () => scrollPosition.value,
    (a, b) => a !== b && scheduleOnRN(resetHideTimeout),
  );

  const scrollByTranslationY = (offset: number) => {
    scrollViewReference.current?.scrollToOffset({
      offset,
      animated: false,
    });
  };

  const scrollDragGesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(e => {
          scheduleOnRN(resetHideTimeout);
          startScrollY.value = e.y + scrollBarY.value;
          showLegend.value = 1;
        })
        .onChange(e => {
          // the actual thumb range is half bar size - height - half bar size
          // and this gets intrapolated to 0 - 1 for scrollToPercent
          const halfBar = barHeightP.value / 2;

          const clampedScrollToPercent = interpolate(
            startScrollY.value + e.translationY,
            [halfBar, scrollViewHeight.value - halfBar],
            [0, 1],
            Extrapolation.CLAMP,
          );
          scheduleOnRN(
            scrollByTranslationY,
            clampedScrollToPercent * contentHeight.value,
          );
        })
        .onEnd(() => {
          showLegend.value = 0;
        }),
    [],
  );

  const scrollBarDynamicStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(
        scrollIndicatorOpacity.value,
        scrollTimingAnimConfig,
        () =>
          scrollIndicatorOpacity.value === 0 &&
          scheduleOnRN(setScrollBarVisible, false),
      ),
      height: barHeightP.value,
      top: scrollBarY.value,
    };
  });

  const ScrollBar = () => {
    if (!scrollBarVisible) return <View collapsable={false} />;
    return (
      <Animated.View
        style={[scrollBarDynamicStyle, styles.indicatorStaticStyle]}
      >
        {LegendContent !== undefined && (
          <LegendContent
            scrollViewReference={scrollViewReference}
            scrollOffset={scrollOffset}
            showLegend={showLegend}
          />
        )}
      </Animated.View>
    );
  };

  return (
    <View style={style}>
      <GestureDetector gesture={scrollDragGesture}>
        <ScrollBar />
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
    width: 27,
    borderRadius: 0,
    zIndex: 10,
  },
});
