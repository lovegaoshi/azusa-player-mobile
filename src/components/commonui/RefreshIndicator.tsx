import React, { useState } from 'react';
import { LayoutRectangle, Text, View } from 'react-native';
import { Icon } from 'react-native-paper';
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

interface IndicatorProps {
  pullDistanceValue: SharedValue<number>;
  refreshRange?: number;
}

export const DebugIndicator = ({ pullDistanceValue }: IndicatorProps) => {
  const [value, setValue] = useState(0);

  useAnimatedReaction(
    () => pullDistanceValue.value,
    curr => {
      scheduleOnRN(setValue, curr);
    },
  );

  return (
    <Text style={{ backgroundColor: 'black', color: 'white' }}>
      {value.toFixed(2)}
    </Text>
  );
};

const SpinningIndicator = ({
  pullDistanceValue,
  refreshRange = -200,
}: IndicatorProps) => {
  const opacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pullDistanceValue.value, [0, refreshRange], [0, 1]),
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${180 - pullDistanceValue.value}deg` }],
  }));

  return (
    <View style={{ backgroundColor: 'white', borderRadius: 50, padding: 5 }}>
      <Animated.View style={[animatedStyle, opacityStyle]}>
        <Icon source="refresh" size={30} color="black" />
      </Animated.View>
    </View>
  );
};

interface Props {
  pullUpActivated: SharedValue<number>;
  pullUpDistance: SharedValue<number>;
  layout?: LayoutRectangle;
  indicatorOffset?: number;
  pullRange?: number;
  refreshRange?: number;
  Indicator?: ({ pullDistanceValue }: IndicatorProps) => JSX.Element;
}

export default function RefreshIndicator({
  pullUpActivated,
  pullUpDistance,
  layout,
  indicatorOffset = -50,
  pullRange = -100,
  refreshRange = -300,
  Indicator = SpinningIndicator,
}: Props) {
  const opacity = useSharedValue(0);
  const [visible, setVisible] = useState(false);

  // HACK: so the spinner doesnt move down, but stay there and fade out then
  // pullUpDIstance is set to 0
  useAnimatedReaction(
    () => pullUpActivated.value,
    curr => {
      if (curr === 0) {
        opacity.value = 1;
        opacity.value = withTiming(0, { duration: 400 }, () => {
          pullUpDistance.value = 0;
          scheduleOnRN(setVisible, false);
        });
      }
    },
  );

  useAnimatedReaction(
    () => pullUpDistance.value,
    curr => {
      if (curr < -1) {
        scheduleOnRN(setVisible, true);
      }
    },
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(pullUpDistance.value, [0, pullRange], [0, -20]),
      },
    ],
    opacity:
      opacity.value ||
      interpolate(pullUpDistance.value, [0, pullRange], [0, 1]),
  }));

  if (!visible) return <></>;

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
    >
      <Indicator
        pullDistanceValue={pullUpDistance}
        refreshRange={refreshRange}
      />
    </Animated.View>
  );
}
