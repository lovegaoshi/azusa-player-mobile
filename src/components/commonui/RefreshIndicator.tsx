import React, { useState } from 'react';
import { LayoutRectangle, Text } from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface IndicatorProps {
  pullDistanceValue: number;
}
const DebugIndicator = ({ pullDistanceValue }: IndicatorProps) => {
  return (
    <Text style={{ backgroundColor: 'black', color: 'white' }}>
      {pullDistanceValue.toFixed(2)}
    </Text>
  );
};

interface Props {
  pullUpDistance: SharedValue<number>;
  layout?: LayoutRectangle;
  indicatorOffset?: number;
  pullRange?: number;
  Indicator?: ({ pullDistanceValue }: IndicatorProps) => JSX.Element;
}

export default ({
  pullUpDistance,
  layout,
  indicatorOffset = -50,
  pullRange = -100,
  Indicator = DebugIndicator,
}: Props) => {
  const [value, setValue] = useState(0);

  useAnimatedReaction(
    () => pullUpDistance.value,
    curr => {
      runOnJS(setValue)(curr);
    },
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(pullUpDistance.value, [0, pullRange], [0, -20]),
      },
    ],
    opacity: interpolate(pullUpDistance.value, [0, pullRange], [0, 1]),
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          alignItems: 'center',
          left: 0,
          width: layout?.width ?? 0,
          top: (layout?.height ?? -999) + indicatorOffset,
        },
        animatedStyle,
      ]}
      onLayout={e => console.log('scrollindicatorlayout', e.nativeEvent.layout)}
    >
      <Indicator pullDistanceValue={value} />
    </Animated.View>
  );
};
