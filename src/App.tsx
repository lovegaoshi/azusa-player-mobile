import React from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  GestureHandlerRootView,
  ScrollView,
  createNativeWrapper,
} from 'react-native-gesture-handler';
import { FlashList } from '@shopify/flash-list';
import Animated from 'react-native-reanimated';

const GestureFlashList = createNativeWrapper(FlashList);
const AnimatedFlashList = Animated.createAnimatedComponent(GestureFlashList);

export default () => {
  return (
    <GestureHandlerRootView>
      <AnimatedFlashList
        data={Array.from(Array(100).keys())}
        renderItem={({ item }) => <Text>{item}</Text>}
        renderScrollComponent={ScrollView}
      />
    </GestureHandlerRootView>
  );
};
