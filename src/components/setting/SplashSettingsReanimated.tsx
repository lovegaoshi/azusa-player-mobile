/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { imageSplashes } from '../background/AppOpenSplash';

export default () => {
  const [index, setIndex] = React.useState(0);
  const cardPositionX = useSharedValue(0);
  const cardPositionY = useSharedValue(0);

  const isIndexEnd = (i: number) => {
    return index === imageSplashes.length - 1 && i === 0;
  };
  const swipeGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .onStart(e => console.log('start, e'))
        .onChange(e => {
          cardPositionX.value = e.translationX;
          cardPositionY.value = e.translationY;
        })
        .onEnd(e => {
          if (e.translationX > 120) {
            cardPositionX.value = withTiming(WindowWidth + 100, {
              duration: 200,
            });
          } else if (e.translationX < -120) {
            cardPositionX.value = withTiming(-WindowWidth - 100, {
              duration: 200,
            });
          } else {
            cardPositionX.value = withSpring(0);
            cardPositionY.value = withSpring(0);
          }
        }),
    [],
  );

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: cardPositionX.value },
        { translateY: cardPositionY.value },
        {
          rotate:
            String(
              interpolate(
                cardPositionX.value,
                [-WindowWidth, 0, WindowWidth],
                [-10, 0, 10],
                Extrapolation.CLAMP,
              ),
            ) + 'deg',
        },
      ],
    };
  });

  const nextCardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            cardPositionX.value,
            [-WindowWidth / 2, 0, WindowWidth / 2],
            [1, 0.8, 1],
            Extrapolation.CLAMP,
          ),
        },
      ],
      opacity: interpolate(
        cardPositionX.value,
        [-WindowWidth / 2, 0, WindowWidth / 2],
        [1, 0, 1],
        Extrapolation.CLAMP,
      ),
    };
  });

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={styles.view}>
        {imageSplashes
          .map((splash, i) => (
            <Animated.View
              style={[
                styles.animatedView,
                i === index && cardStyle,
                (i === index + 1 || isIndexEnd(i)) && nextCardStyle,
              ]}
            >
              <Image
                // source={i < index || i > index + 1 ? undefined : splash()}
                source={
                  (i >= index && i < index + 2) || isIndexEnd(i)
                    ? splash[1]()
                    : undefined
                }
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
  },
});
