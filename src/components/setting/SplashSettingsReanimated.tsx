/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { imageSplashes } from '../background/AppOpenSplash';

const ImageHolderCount = 3;

export default () => {
  const [index, setIndex] = React.useState(0);
  const cardPositionX = useSharedValue(0);
  const cardPositionY = useSharedValue(0);
  const boundingBack = useSharedValue(0);

  const incIndex = () => setIndex(v => v + 1);
  const getSourceIndex = (position: number) => {
    const mod = index % ImageHolderCount;
    if (position === 0 && mod !== 0) {
      return index - mod + ImageHolderCount;
    }
    return index - mod + position;
  };

  const getSource = (i: number) => imageSplashes[i % imageSplashes.length][1]();

  const swipeGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          if (cardPositionX.value !== 0 && boundingBack.value !== 0) {
            cardPositionX.value = 0;
            cardPositionY.value = 0;
            runOnJS(incIndex)();
          }
          boundingBack.value = 0;
        })
        .onChange(e => {
          cardPositionX.value = e.translationX;
          cardPositionY.value = e.translationY;
        })
        .onEnd(e => {
          if (e.translationX > 120) {
            cardPositionX.value = withTiming(
              windowEnd,
              { duration: 200 },
              () => cardPositionX.value === windowEnd && runOnJS(incIndex)(),
            );
          } else if (e.translationX < -120) {
            cardPositionX.value = withTiming(
              -windowEnd,
              { duration: 200 },
              () => cardPositionX.value === -windowEnd && runOnJS(incIndex)(),
            );
          } else {
            boundingBack.value = 0;
            cardPositionX.value = withSpring(0);
            cardPositionY.value = withSpring(0);
          }
        }),
    [],
  );

  const cardStyle = useAnimatedStyle(() => {
    return {
      opacity: 1,
      transform: [
        { translateX: cardPositionX.value },
        { translateY: cardPositionY.value },
        {
          rotate: `${interpolate(
            cardPositionX.value,
            [-WindowWidth, 0, WindowWidth],
            [-10, 0, 10],
            Extrapolation.CLAMP,
          )}deg`,
        },
      ],
    };
  });

  const nextCardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: 0 },
        { translateY: 0 },
        { rotate: '0deg' },
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

  const hiddenStyle = useAnimatedStyle(() => {
    return {
      opacity: 0,
    };
  });

  const getStyle = (i: number) => {
    const mod = index % ImageHolderCount;
    if (mod === i) return cardStyle;
    if ((mod + 1) % ImageHolderCount === i) return nextCardStyle;
    return hiddenStyle;
  };

  React.useEffect(() => {
    cardPositionX.value = 0;
    cardPositionY.value = 0;
  }, [index]);

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={styles.view}>
        {Array.from(Array(ImageHolderCount).keys())
          .map((_, i) => (
            <Animated.View key={i} style={[styles.animatedView, getStyle(i)]}>
              <Text
                style={{ position: 'absolute' }}
              >{`       ${i} ${index}`}</Text>
              <Image
                source={getSource(getSourceIndex(i))}
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
const windowEnd = WindowWidth + 100;

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
    marginTop: -120,
  },
});
