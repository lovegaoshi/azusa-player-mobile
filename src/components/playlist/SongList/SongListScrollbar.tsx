import { FlashList } from '@shopify/flash-list';
import { RefObject, useEffect, useRef } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  runOnJS,
  useDerivedValue,
} from 'react-native-reanimated';

const SCROLLBAR_HIDE_TIMEOUT = 3000;
const SCROLLBAR_ANIM_TIME = 300;

interface Props {
  children: JSX.Element | JSX.Element[];
  scrollViewReference: RefObject<FlashList<NoxMedia.Song>>;
  style?: StyleProp<ViewStyle>;
  scrollViewHeight: number;
  contentViewHeight: number;
  scrollPositionY: number;
}

export default function CustomScrollView({
  children,
  scrollViewReference,
  style,
  scrollViewHeight,
  contentViewHeight,
  scrollPositionY,
}: Props) {
  const scrollBarStartPosY = useRef(0);
  const scrollTimeoutId = useRef<NodeJS.Timeout>();
  const scrollIndicatorFromTopPos = useSharedValue(0);
  const scrollIndicatorOpacity = useSharedValue(1);
  const scrollIndicatorHeight = useDerivedValue(() => {
    if (
      scrollViewHeight > 0 &&
      contentViewHeight > 0 &&
      contentViewHeight > scrollViewHeight
    ) {
      const calculateScrollIndicatorHeight =
        (scrollViewHeight / contentViewHeight) * scrollViewHeight;
      return Math.max(calculateScrollIndicatorHeight, 100);
    } else {
      return 0;
    }
  });

  const scrollTimingAnimConfig = {
    duration: SCROLLBAR_ANIM_TIME,
    easing: Easing.linear,
  };

  const calculateScrollBarIndicatorPosition = (maxScrollFromTop: number) => {
    const scrollPercentage = Math.min(
      Math.max(scrollPositionY / (contentViewHeight - scrollViewHeight), 0),
      1,
    );
    return Math.ceil(maxScrollFromTop * scrollPercentage);
  };

  const createScrollHideTimeout = (timeout: number) => {
    return setTimeout(() => {
      scrollIndicatorOpacity.value = 0;
    }, timeout);
  };

  const resetHideTimeout = (timeout: number) => {
    scrollIndicatorOpacity.value = 1;
    clearTimeout(scrollTimeoutId.current);
    scrollTimeoutId.current = createScrollHideTimeout(timeout);
  };

  useEffect(() => {
    const scrollBarIndicatorHeight = scrollIndicatorHeight.value;
    const maxScrollFromTop = scrollViewHeight - scrollBarIndicatorHeight;
    const scrollBarIndicatorPosition =
      calculateScrollBarIndicatorPosition(maxScrollFromTop);
    scrollIndicatorFromTopPos.value = scrollBarIndicatorPosition;
    resetHideTimeout(SCROLLBAR_HIDE_TIMEOUT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentViewHeight, scrollPositionY]); // scrollViewHeight

  useEffect(() => {
    scrollTimeoutId.current = createScrollHideTimeout(SCROLLBAR_HIDE_TIMEOUT);
    return () => {
      clearTimeout(scrollTimeoutId.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateScrollPositionY = (scrollPositionY: number) => {
    scrollViewReference.current?.scrollToOffset({
      offset: scrollPositionY,
      animated: false,
    });
  };

  const scrollByTranslationY = (translationY: number) => {
    const maxScrollFromTop = scrollViewHeight - scrollIndicatorHeight.value;
    const scrollPosition =
      (contentViewHeight - scrollViewHeight) *
        (translationY / maxScrollFromTop) +
      scrollBarStartPosY.current;
    // This fix the scrolling hang on Android
    setTimeout(() => {
      updateScrollPositionY(scrollPosition);
    }, 10);
  };

  const setScrollPositionStart = () => {
    scrollBarStartPosY.current = scrollPositionY;
  };

  const scrollDragGesture = Gesture.Pan()
    .onBegin(() => {
      runOnJS(setScrollPositionStart)();
    })
    .onChange(e => {
      runOnJS(scrollByTranslationY)(e.translationY);
    });

  const scrollBarDynamicStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(scrollIndicatorOpacity.value, scrollTimingAnimConfig),
      height: scrollIndicatorHeight.value,
      top: scrollIndicatorFromTopPos.value || 0,
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
    width: 75,
    borderRadius: 0,
    zIndex: 10,
  },
});
