import { View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useEffect, useMemo } from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import MaskedView from '@react-native-masked-view/masked-view';
import { scheduleOnRN } from 'react-native-worklets';

export interface SliderProps {
  onValueStart?: (value: number) => void;
  onValueChange?: (value: number) => void;
  onValueEnd?: (value: number) => void;
}

interface Props extends SliderProps {
  min?: number;
  max?: number;
  defaultValue?: number;
  borderRadius?: number;
  height?: number;
  sliderBackgroundColor?: string;
  sliderForegroundColor?: string;
}

export default function RNGHSlider({
  onValueStart = console.log,
  onValueChange = console.log,
  onValueEnd = console.log,
  min = 0,
  max = 1,
  defaultValue = 0,
  borderRadius = 10,
  height = 50,
  sliderBackgroundColor = 'red',
  sliderForegroundColor = 'blue',
}: Props) {
  const maxWidth = useSharedValue(0);
  const value = useSharedValue(0);

  const sliderStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(`${value.value * 100}%`, { duration: 30 }),
    };
  });

  const interpolateVal = (x: number) => {
    'worklet';
    return interpolate(x, [0, maxWidth.value], [min, max], Extrapolation.CLAMP);
  };

  const dragGesture = useMemo(
    () =>
      Gesture.Pan()
        .onStart(e => {
          onValueStart && scheduleOnRN(onValueStart, interpolateVal(e.x));
        })
        .onChange(e => {
          const slideVal = interpolateVal(e.x);
          const slidePos = interpolate(
            e.x,
            [0, maxWidth.value],
            [0, 1],
            Extrapolation.CLAMP,
          );
          value.value = slidePos;
          onValueChange && scheduleOnRN(onValueChange, slideVal);
        })
        .onEnd(e => {
          const slideVal = interpolateVal(e.x);
          onValueEnd && scheduleOnRN(onValueEnd, slideVal);
        }),
    [],
  );

  useEffect(() => {
    value.value = interpolate(defaultValue, [min, max], [0, 1]);
  }, [defaultValue]);

  return (
    <GestureDetector gesture={dragGesture}>
      <MaskedView
        style={{ flex: 1, height }}
        onLayout={e => {
          maxWidth.value = e.nativeEvent.layout.width;
        }}
        maskElement={
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              borderRadius,
            }}
          />
        }
      >
        <View style={{ flex: 1, height: 50 }}>
          <Animated.View
            style={[
              {
                height,
                position: 'absolute',
                backgroundColor: sliderForegroundColor,
                zIndex: 1,
                width: '50%',
              },
              sliderStyle,
            ]}
          />
          <View
            style={{
              backgroundColor: sliderBackgroundColor,
              flex: 1,
              height,
            }}
          />
        </View>
      </MaskedView>
    </GestureDetector>
  );
}
