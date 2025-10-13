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
import { scheduleOnRN } from 'react-native-worklets';

import { imageSplashes } from '../background/AppOpenSplash';

const ImageHolderCount = 3;
enum ImagePos {
  Current = 0,
  Next = 1,
  Others = 2,
}

const getImagePosition = (index: number, position: number) => {
  const mod = index % ImageHolderCount;
  if (mod === position) return ImagePos.Current;
  if ((mod + 1) % ImageHolderCount === position) return ImagePos.Next;
  return ImagePos.Others;
};

export default function SplashSettings() {
  const [index, setIndex] = React.useState(0);
  const cardPositionX = useSharedValue(0);
  const cardPositionY = useSharedValue(0);
  const boundingBack = useSharedValue(0);
  const viewHeight = useSharedValue(0);
  const WindowHeight = Dimensions.get('window').height;

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
          if (cardPositionX.value !== 0 && boundingBack.value === 0) {
            cardPositionX.value = 0;
            cardPositionY.value = 0;
            scheduleOnRN(incIndex);
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
              () => cardPositionX.value === windowEnd && scheduleOnRN(incIndex),
            );
          } else if (e.translationX < -120) {
            cardPositionX.value = withTiming(
              -windowEnd,
              { duration: 200 },
              () =>
                cardPositionX.value === -windowEnd && scheduleOnRN(incIndex),
            );
          } else {
            boundingBack.value = 1;
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

  const cardHeightOffsetStyle = useAnimatedStyle(() => ({
    marginTop: (viewHeight.value - WindowHeight) / 2,
  }));

  const getStyle = (i: number) => {
    switch (getImagePosition(index, i)) {
      case ImagePos.Current:
        return cardStyle;
      case ImagePos.Next:
        return nextCardStyle;
      default:
        return hiddenStyle;
    }
  };

  React.useEffect(() => {
    cardPositionX.value = 0;
    cardPositionY.value = 0;
  }, [index]);

  return (
    <GestureDetector gesture={swipeGesture}>
      <View
        style={styles.view}
        onLayout={e => (viewHeight.value = e.nativeEvent.layout.height)}
      >
        {Array.from(new Array(ImageHolderCount).keys())
          .map((_, i) => (
            <Animated.View
              key={i}
              style={[styles.animatedView, getStyle(i), cardHeightOffsetStyle]}
            >
              <Image
                source={
                  getImagePosition(index, i) === ImagePos.Others
                    ? undefined
                    : (getSource(getSourceIndex(i)) as number)
                }
                style={styles.flex}
                contentFit={'contain'}
              />
            </Animated.View>
          ))
          .reverse()}
      </View>
    </GestureDetector>
  );
}

const WindowWidth = Dimensions.get('window').width;
const windowEnd = WindowWidth + 100;

const styles = StyleSheet.create({
  view: {
    flex: 1,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
  flex: {
    flex: 1,
  },
  animatedView: {
    flex: 1,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    position: 'absolute',
  },
});
