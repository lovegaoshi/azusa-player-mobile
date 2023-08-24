import React, { useRef } from 'react';
import { Pressable, Animated, Easing, ViewStyle } from 'react-native';
import LottieView, { AnimationObject } from 'lottie-react-native';

import { useNoxSetting } from '@hooks/useSetting';

interface Props {
  src: AnimationObject;
  onPress: () => void;
  strokes?: string[];
  size: number;
  clicked: boolean;
  clickedLottieProgress?: number;
  duration?: number;
  pressableStyle?: ViewStyle;
  lottieStyle?: ViewStyle;
}

const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

const LottieButtonAnimated = ({
  src,
  onPress,
  clickedLottieProgress = 0.5,
  strokes = [],
  size,
  clicked,
  duration = 340,
  pressableStyle,
  lottieStyle,
}: Props) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const managedClicked = useRef(clicked);
  const animationProgress = useRef(
    new Animated.Value(clicked ? clickedLottieProgress : 0)
  );

  React.useEffect(() => {
    if (clicked === managedClicked.current) {
      return;
    }
    animationProgress.current.setValue(clicked ? clickedLottieProgress : 0);
    managedClicked.current = clicked;
  }, [clicked]);

  const onPressBtn = () => {
    managedClicked.current = !clicked;
    onPress();
    if (clicked) {
      Animated.timing(animationProgress.current, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(() => animationProgress.current.setValue(0));
    } else {
      Animated.timing(animationProgress.current, {
        toValue: clickedLottieProgress,
        duration,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
  };

  return (
    <Pressable
      style={{
        backgroundColor: playerStyle.customColors.btnBackgroundColor,
        width: size + 16,
        height: size + 16,
        borderRadius: size / 2 + 8,
        ...pressableStyle,
      }}
      onPress={onPressBtn}
    >
      <AnimatedLottieView
        source={src}
        progress={animationProgress.current}
        style={{
          width: size,
          height: size,
          marginLeft: 8,
          marginTop: 8,
          ...lottieStyle,
        }}
        colorFilters={strokes.map(keypath => ({
          keypath,
          color: playerStyle.colors.primary,
        }))}
      />
    </Pressable>
  );
};

export default LottieButtonAnimated;
