import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { IconButton, Text, ActivityIndicator } from 'react-native-paper';

import FlexView from '@components/commonui/FlexViewNewArch';
import { NoxRoutes } from '@enums/Routes';
import useArtist from '@stores/explore/artist';

export default ({ navigation }: NoxComponent.StackNavigationProps) => {
  const loading = useArtist(state => state.loading);
  const result = useArtist(state => state.result);

  const scrollYOffset = useSharedValue(0);
  const scrollYHeight = useSharedValue(0);

  const animatedHeaderStyle = useAnimatedStyle(() => {
    const visibleOffsetRange = scrollYOffset.value - scrollYHeight.value / 3;
    return {
      opacity: visibleOffsetRange > 0 ? withTiming(1) : withTiming(0),
    };
  });

  if (loading) {
    return (
      <FlexView>
        <View>
          <View style={mStyles.indicatorContainer} />
          <ActivityIndicator size={100} />
        </View>
      </FlexView>
    );
  }

  if (result === undefined) {
    return (
      <FlexView>
        <View style={{ paddingLeft: 10 }}>
          <View style={mStyles.indicatorContainer} />
          <Text variant="titleLarge">Uh oh...</Text>
          <Text variant="bodyLarge">
            Nothing will be displayed. You shouldnt be here.
          </Text>
        </View>
      </FlexView>
    );
  }

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

const mStyles = StyleSheet.create({
  indicatorContainer: {
    height: 40,
  },
});
