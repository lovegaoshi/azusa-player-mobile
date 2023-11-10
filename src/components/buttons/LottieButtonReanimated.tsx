/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect } from 'react';
import { Pressable, Animated, Easing } from 'react-native';
import LottieView, { AnimationObject } from 'lottie-react-native';

import { useNoxSetting } from '@hooks/useSetting';
import ShadowedElement from './ShadowedElement';

const clickedStatesMap = Array.from(Array(10).keys()).map(curr =>
  Array.from(Array(curr + 1).keys()).map(val => val / curr + 1)
);

interface Props {
  src: AnimationObject;
  onPress: () => void;
  strokes?: string[];
  size: number;
  clickState: any;
  clickStates: any[];
  clickedLottieProgress?: number[];
  duration?: number;
  accessibilityLabel?: string;
}

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

const LottieButtonAnimated = ({
  src,
  onPress,
  strokes = [],
  size,
  clickState,
  clickStates,
  clickedLottieProgress = clickedStatesMap[clickStates.length],
  duration = 340,
  accessibilityLabel,
}: Props) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const managedState = useRef(clickState);
  const managedProgress = useRef(Math.max(0, clickStates.indexOf(clickState)));
  const animationProgress = useRef(
    new Animated.Value(clickedLottieProgress[managedProgress.current])
  );

  const onPressBtn = () => {
    onPress();
    const nextProgress = managedProgress.current + 1;
    Animated.timing(animationProgress.current, {
      toValue: clickedLottieProgress[nextProgress],
      duration,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => {
      if (nextProgress >= clickedLottieProgress.length) {
        animationProgress.current.setValue(0);
      }
    });
    managedProgress.current =
      nextProgress >= clickedLottieProgress.length ? 0 : nextProgress;
    managedState.current = clickStates[managedProgress.current];
  };

  useEffect(() => {
    if (clickState === managedState.current) return;
    animationProgress.current.setValue(
      clickedLottieProgress[managedProgress.current]
    );
    managedState.current = clickState;
    managedProgress;
  }, [clickState]);

  return (
    <ShadowedElement
      style={{
        backgroundColor: playerStyle.customColors.btnBackgroundColor,
        width: size + 16,
        height: size + 16,
        borderRadius: size / 2 + 8,
      }}
    >
      <Pressable onPress={onPressBtn} accessibilityLabel={accessibilityLabel}>
        <AnimatedLottieView
          source={src}
          progress={animationProgress.current}
          style={{ width: size, height: size, marginLeft: 8, marginTop: 8 }}
          colorFilters={strokes.map(keypath => ({
            keypath,
            color: playerStyle.colors.primary,
          }))}
        />
      </Pressable>
    </ShadowedElement>
  );
};

export default LottieButtonAnimated;
