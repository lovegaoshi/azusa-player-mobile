import { View, ImageStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useEffect, useMemo, useState } from 'react';
import { Image } from 'expo-image';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';

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
  throttle?: boolean;
}

/**
 * carousel is made up by 3 animated.View;
 * carouselIndex tracks which one is active
 */
export default function HorizontalCarousel({
  images,
  getImgSource,
  imgStyle,
  paddingVertical = 0,
  callback = () => undefined,
  active = true,
  throttle = true,
}: Props) {
  // this number is contrained to 0, 1, 2
  const carouselIndex = useSharedValue(1);
  const [mImages, setMImages] = useState(images);
  const [throttling, setThrottling] = useState(false);

  const imgWidth = (imgStyle?.width as number) + paddingVertical;
  const defaultGetImgSource = (i: number, arr = images) => arr[i];
  const resolveImgSource = getImgSource ?? defaultGetImgSource;
  const activeCarouselX = useSharedValue(0);
  const activeCarouselTX = useSharedValue(0);
  const carouselXs = useSharedValue([-imgWidth, 0, imgWidth]);

  const toggleThrottle = (to = true) => {
    if (throttle) {
      setThrottling(to);
    }
  };

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
          scheduleOnRN(callback, direction, prevIndex);
          scheduleOnRN(toggleThrottle, true);
        },
      );
      return;
    }
    activeCarouselTX.value = withTiming(0, { duration: 100 });
  };

  const scrollDragGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(active && !throttling)
        // swipe left and right
        .activeOffsetX([-5, 5])
        .failOffsetY([-5, 5])
        .onChange(e => {
          activeCarouselTX.value = e.translationX;
        })
        .onEnd(snapToCarousel),
    [active, throttling],
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

  useEffect(() => {
    const newImages = [];
    newImages[carouselIndex.value] = images[1];
    newImages[incIndex(carouselIndex.value, 3)] = images[2];
    newImages[incIndex(carouselIndex.value, 3, false)] = images[0];
    setMImages(newImages);
    toggleThrottle(false);
  }, [images]);

  return (
    <GestureDetector gesture={scrollDragGesture}>
      <View>
        <AnimatedExpoImage
          style={[imgStyle, carousel1Style]}
          source={resolveImgSource(0, mImages)}
        />
        <AnimatedExpoImage
          style={[imgStyle, carousel2Style]}
          source={resolveImgSource(1, mImages)}
        />
        <AnimatedExpoImage
          style={[imgStyle, carousel3Style]}
          source={resolveImgSource(2, mImages)}
        />
      </View>
    </GestureDetector>
  );
}
