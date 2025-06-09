/**
 * a wrapper on scrollView that a header is scrolled to hidden when the scrollview is scrolling down;
 * then scrolled to show when the scrollview is scrolling up
 */

import { ReactNode, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  View,
  ScrollView,
} from 'react-native';
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

interface Props {
  HeaderComponent: () => ReactNode;
  ScrollableComponent: (p: {
    onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  }) => ReactNode;
}

const AnimatedHeader = ({ HeaderComponent, ScrollableComponent }: Props) => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const scrollPosition = useSharedValue(0);
  const lastScrollPosition = useSharedValue(0);

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: -scrollPosition.value }],
    };
  });

  return (
    <View style={{ overflow: 'hidden' }}>
      <Animated.View
        style={[
          {
            opacity: headerHeight === 0 ? 0 : 1,
            zIndex: 1,
          },
          animatedHeaderStyle,
        ]}
        onLayout={e => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <HeaderComponent />
      </Animated.View>
      {headerHeight !== 0 && (
        <Animated.View style={animatedHeaderStyle}>
          <ScrollableComponent
            onScroll={e => {
              scrollPosition.value = clamp(
                scrollPosition.value -
                  lastScrollPosition.value +
                  e.nativeEvent.contentOffset.y,
                0,
                headerHeight,
              );
              lastScrollPosition.value = e.nativeEvent.contentOffset.y;
            }}
          />
        </Animated.View>
      )}
    </View>
  );
};

export const AnimatedHeaderExample = () => {
  return (
    <AnimatedHeader
      HeaderComponent={() => (
        <View>
          <Text>Header</Text>
          <Text>Header</Text>
          <Text>Header</Text>
          <Text>Header</Text>
          <Text>Header</Text>
          <Text>Header</Text>
          <Text>Header</Text>
          <Text>Header</Text>
          <Text>Header</Text>
        </View>
      )}
      ScrollableComponent={({ onScroll }) => (
        <ScrollView onScroll={onScroll} scrollEventThrottle={20}>
          {Array.from({ length: 100 }).map((m, i) => (
            <Text key={i}>{`item ${i}`}</Text>
          ))}
        </ScrollView>
      )}
    />
  );
};

export default AnimatedHeader;
