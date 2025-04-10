/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import Animated from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { imageSplashes } from '../background/AppOpenSplash';

export default () => {
  const [index, setIndex] = React.useState(0);
  const swipeGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .enabled(false)
        .onStart(() => undefined)
        .onChange(() => undefined)
        .onEnd(() => undefined),
    [],
  );

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={styles.view}>
        {imageSplashes
          .map((splash, i) => (
            <Animated.View>
              <Image
                // source={i < index || i > index + 1 ? undefined : splash()}
                source={splash[1]()}
                style={styles.splashCard}
                contentFit={'contain'}
              />
            </Animated.View>
          ))
          .reverse()}
      </View>
    </GestureDetector>
  );
};

const WindowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  view: {
    flex: 1,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
  expandObject: {
    flex: 1,
  },
  animatedView: {
    flex: 1,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    position: 'absolute',
  },
  splashCard: {
    flex: 1,
    // HACK: ???
    marginTop: -120,
  },
});
