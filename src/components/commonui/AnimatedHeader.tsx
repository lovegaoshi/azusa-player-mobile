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
  Pressable,
} from 'react-native';
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import MaskedView from '@react-native-masked-view/masked-view';

interface Props {
  HeaderComponent: () => ReactNode;
  ScrollableComponent: (p: {
    onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
    HeaderPlaceholderBlock: () => ReactNode;
  }) => ReactNode;
  fade?: boolean;
}

const AnimatedHeader = ({
  HeaderComponent,
  ScrollableComponent,
  fade,
}: Props) => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const scrollPosition = useSharedValue(0);
  const lastScrollPosition = useSharedValue(0);

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: -scrollPosition.value }],
      opacity: fade ? 1 - scrollPosition.value / headerHeight : 1,
    };
  });

  const animatedHeaderPlaceholderStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight - scrollPosition.value,
    };
  });

  return (
    <View style={{ overflow: 'hidden' }}>
      <Animated.View
        style={[
          {
            opacity: headerHeight === 0 ? 0 : 1,
            zIndex: 1,
            position: 'absolute',
          },
          animatedHeaderStyle,
        ]}
        onLayout={e => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <HeaderComponent />
      </Animated.View>
      {headerHeight !== 0 && (
        <MaskedView
          maskElement={
            <View>
              <Animated.View style={animatedHeaderPlaceholderStyle} />
              <View
                style={{
                  backgroundColor: 'rgba(0,0,0,1)',
                  width: 9999,
                  height: 9999,
                }}
              />
            </View>
          }
          androidRenderingMode={'software'}
        >
          <ScrollableComponent
            HeaderPlaceholderBlock={() => (
              <View style={{ height: headerHeight }} />
            )}
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
        </MaskedView>
      )}
    </View>
  );
};

export const AnimatedHeaderExample = () => {
  return (
    <AnimatedHeader
      fade
      HeaderComponent={() => (
        <View>
          <Pressable onPress={() => console.log(1)}>
            <Text>Header</Text>
          </Pressable>
          <Pressable onPress={() => console.log(12)}>
            <Text>Header</Text>
          </Pressable>
          <Pressable onPress={() => console.log(13)}>
            <Text>Header</Text>
          </Pressable>
          <Pressable onPress={() => console.log(14)}>
            <Text>Header</Text>
          </Pressable>
          <Pressable onPress={() => console.log(15)}>
            <Text>Header</Text>
          </Pressable>
        </View>
      )}
      ScrollableComponent={({ onScroll, HeaderPlaceholderBlock }) => (
        <ScrollView onScroll={onScroll}>
          <HeaderPlaceholderBlock />
          {Array.from({ length: 100 }).map((m, i) => (
            <Text key={i}>{`item ${i}`}</Text>
          ))}
        </ScrollView>
      )}
    />
  );
};

export default AnimatedHeader;
