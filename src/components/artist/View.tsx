import { ScrollView, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { IconButton, Text } from 'react-native-paper';

import FlexView from '@components/commonui/FlexViewNewArch';
import { NoxRoutes } from '@enums/Routes';

export default ({ navigation }: NoxComponent.StackNavigationProps) => {
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
            zIndex: 1,
          }}
        >
          <IconButton
            icon={'arrow-left'}
            onPress={() => navigation.navigate(NoxRoutes.Playlist)}
            size={30}
          />
          <Animated.View
            style={[{ justifyContent: 'center' }, animatedHeaderStyle]}
          >
            <Text variant="titleLarge">aritst text</Text>
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
