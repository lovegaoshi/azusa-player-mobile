import { useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

interface Props {
  Header: () => React.JSX.Element;
  Content: (p: {
    onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  }) => React.JSX.Element;
  viewStyle?: ViewStyle;
  fade?: boolean;
}

const AnimatedHeader = ({ viewStyle, Header, Content, fade }: Props) => {
  const [headerHeight, setHeaderHeight] = useState(0);
  // 0 - headerHeight
  const headerOffset = useSharedValue(0);
  const previousContentOffset = useSharedValue(0);

  const onScroll = (e: NativeScrollEvent) => {
    'worklet';
    const diff = e.contentOffset.y - previousContentOffset.value;
    headerOffset.value = clamp(headerOffset.value + diff, 0, headerHeight);
    previousContentOffset.value = e.nativeEvent.contentOffset.y;
  };

  const headerStyle = useAnimatedStyle(() => {
    console.log(headerHeight, headerOffset.value);
    return {
      height:
        headerHeight === 0 ? undefined : headerHeight - headerOffset.value,
      opacity: fade ? 1 - headerOffset.value / headerHeight : 1,
    };
  });

  return (
    <View style={[viewStyle]}>
      <Animated.View
        style={[{ overflow: 'hidden' }, headerStyle]}
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
        <ScrollView onScroll={onScroll}>
          {Array.from({ length: 100 }).map((m, i) => (
            <Text key={i}>{`item ${i}`}</Text>
          ))}
        </ScrollView>
      )}
    />
  );
};
