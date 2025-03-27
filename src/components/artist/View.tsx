import { ScrollView, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import FlexView from '@components/commonui/FlexViewNewArch';

export default () => {
  const scrollYOffset = useSharedValue(0);
  const scrollYHeight = useSharedValue(0);

  const animatedHeaderStyle = useAnimatedStyle(() => {
    const visibleOffsetRange = scrollYOffset.value - scrollYHeight.value / 3;
    return {
      opacity: visibleOffsetRange > 0 ? withTiming(1) : withTiming(0),
    };
  });

  return (
    <FlexView>
      <View>
        <View
          style={{
            position: 'absolute',
            flexDirection: 'row',
          }}
        >
          <Text>go back button</Text>
          <Animated.View style={animatedHeaderStyle}>
            <Text>aritst text</Text>
          </Animated.View>
        </View>
        <ScrollView
          onScroll={e => {
            scrollYOffset.value = e.nativeEvent.contentOffset.y;
            scrollYHeight.value = e.nativeEvent.layoutMeasurement.height;
          }}
        >
          <Text style={{ height: 150, textAlign: 'center' }}>
            wow really good
          </Text>
          <Text style={{ height: 150 }}>wow really good</Text>
          <Text style={{ height: 150 }}>wow really good</Text>
          <Text style={{ height: 150 }}>wow really good</Text>
          <Text style={{ height: 150 }}>wow really good</Text>
          <Text style={{ height: 150 }}>wow really good</Text>
          <Text style={{ height: 150 }}>wow really good</Text>
          <Text style={{ height: 150 }}>wow really good</Text>
          <Text style={{ height: 150 }}>wow really good</Text>
        </ScrollView>
      </View>
    </FlexView>
  );
};
