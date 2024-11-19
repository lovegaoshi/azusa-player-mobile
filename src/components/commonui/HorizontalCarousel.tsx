import { View, ImageStyle } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useMemo } from 'react';
import { Image } from 'expo-image';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import _ from 'lodash';

const AnimatedExpoImage = Animated.createAnimatedComponent(Image);

const incIndex = (index: number, len: number, next = true) => {
  'worklet';
  const nextIndex = index + (next ? 1 : -1);
  if (nextIndex >= len) {
    return 0;
  }
  if (nextIndex < 0) {
    return len - 1;
  }
  return nextIndex;
};

interface Props {
  images: any[];
  getImgSource?: (i: number, arr: any[]) => string;
  imgStyle?: ImageStyle;
  paddingVertical?: number;
  callback?: (direction: number, prevIndex: number) => void;
  active?: boolean;
}

/**
 * carousel is made up by 3 animated.View;
 * carouselIndex tracks which one is active
 */
export default ({
  images,
  getImgSource,
  imgStyle,
  paddingVertical = 0,
  callback = () => undefined,
  active = true,
}: Props) => {
  // this number is contrained to 0, 1, 2
  const carouselIndex = useSharedValue(1);

  // priming the carousel src index that the active carousel always take src=1;
  // left to it is 0; right to it is 2. so i can keep resetting images while in order
  const getSrcIndex = (index = 1) => {
    if (index === carouselIndex.value) {
      return 1;
    }
    if (index === incIndex(carouselIndex.value, 3)) {
      return 2;
    }
    return 0;
  };

  const imgWidth = (imgStyle?.width as number) + paddingVertical;
  const defaultGetImgSource = (i: number, arr = images) => arr[i];
  const resolveImgSource = getImgSource ?? defaultGetImgSource;
  const activeCarouselX = useSharedValue(0);
  const activeCarouselTX = useSharedValue(0);
  const carouselXs = useSharedValue([-imgWidth, 0, imgWidth]);

  const snapToCarousel = () => {
    'worklet';
    if (Math.abs(activeCarouselTX.value) > imgWidth * 0.2) {
      const direction = Math.sign(activeCarouselTX.value);
      const prevIndex = incIndex(carouselIndex.value, 3, direction === 1);
      carouselIndex.value = incIndex(carouselIndex.value, 3, direction === -1);
      activeCarouselTX.value = withTiming(
        imgWidth * direction,
        { duration: 100 },
        () => {
          activeCarouselX.value += activeCarouselTX.value;
          activeCarouselTX.value = 0;
          carouselXs.modify(v => {
            v[prevIndex] = v[carouselIndex.value] - imgWidth * direction;
            return v;
          });
          runOnJS(callback)(direction, prevIndex);
        },
      );
      return;
    }
    activeCarouselTX.value = withTiming(0, { duration: 100 });
  };

  const scrollDragGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(active)
        // swipe left and right
        .activeOffsetX([-5, 5])
        .failOffsetY([-5, 5])
        .onChange(e => {
          activeCarouselTX.value = e.translationX;
        })
        .onEnd(snapToCarousel),
    [active],
  );

  const carousel1Style = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          activeCarouselX.value + activeCarouselTX.value + carouselXs.value[0],
      },
    ],
    position: 'absolute',
  }));
  const carousel2Style = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          activeCarouselX.value + activeCarouselTX.value + carouselXs.value[1],
      },
    ],
    position: 'absolute',
  }));
  const carousel3Style = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          activeCarouselX.value + activeCarouselTX.value + carouselXs.value[2],
      },
    ],
    position: 'absolute',
  }));

  return (
    <GestureDetector gesture={scrollDragGesture}>
      <View>
        <AnimatedExpoImage
          style={[imgStyle, carousel1Style]}
          source={{ uri: resolveImgSource(getSrcIndex(0), images) }}
        />
        <AnimatedExpoImage
          style={[imgStyle, carousel2Style]}
          source={{ uri: resolveImgSource(getSrcIndex(1), images) }}
        />
        <AnimatedExpoImage
          style={[imgStyle, carousel3Style]}
          source={{ uri: resolveImgSource(getSrcIndex(2), images) }}
        />
      </View>
    </GestureDetector>
  );
};
