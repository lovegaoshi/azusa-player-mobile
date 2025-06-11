/**
 * an animated header component that animates by component height. this is inferior to both
 * the header and content translateY because the header doesnt "scroll up" to hide, but rather stays the same.
 * this method still causes the flickering regardless so its bad in general.
 */

import { useState } from 'react';
import {
  NativeScrollEvent,
  Pressable,
  ScrollView,
  Text,
  View,
  ViewStyle,
  Animated,
  useAnimatedValue,
} from 'react-native';

interface Props {
  Header: () => React.JSX.Element;
  Content: (p: {
    onScroll: (e: NativeScrollEvent) => void;
  }) => React.JSX.Element;
  viewStyle?: ViewStyle;
  fade?: boolean;
}

const AnimatedHeader = ({ viewStyle, Header, Content }: Props) => {
  const [headerHeight, setHeaderHeight] = useState(0);
  // 0 - headerHeight
  const contentOffset = useAnimatedValue(0);

  const onScroll = (e: NativeScrollEvent) => {
    console.log('onscroll', e);
    contentOffset.setValue(e.contentOffset.y);
  };

  return (
    <View style={[viewStyle]}>
      <Animated.View
        style={[
          { overflow: 'hidden' },
          {
            height:
              headerHeight === 0
                ? undefined
                : Animated.subtract(
                    headerHeight,
                    Animated.diffClamp(contentOffset, 0, headerHeight),
                  ),
          },
        ]}
        onLayout={e =>
          headerHeight === 0 && setHeaderHeight(e.nativeEvent.layout.height)
        }
      >
        <Header />
      </Animated.View>
      <Content onScroll={onScroll} />
    </View>
  );
};

export default AnimatedHeader;

export const AnimatedHeaderExample = () => {
  return (
    <AnimatedHeader
      viewStyle={{ paddingVertical: 100 }}
      fade
      Header={() => (
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
      Content={({ onScroll }) => (
        <ScrollView onScroll={e => onScroll(e.nativeEvent)}>
          {Array.from({ length: 100 }).map((m, i) => (
            <Text key={i}>{`item ${i}`}</Text>
          ))}
        </ScrollView>
      )}
    />
  );
};
