import React, { useRef } from 'react';
import { Pressable, Animated, Easing, ViewStyle } from 'react-native';
import LottieView, { AnimationObject } from 'lottie-react-native';

import { useNoxSetting } from '@stores/useApp';
import ShadowedElement from './ShadowedElement';

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
  accessibilityLabel?: string;
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
  accessibilityLabel,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <ShadowedElement
      style={{
        backgroundColor: playerStyle.customColors.btnBackgroundColor,
        borderRadius: size / 2 + 8,
        width: size + 16,
        height: size + 16,
        ...pressableStyle,
      }}
    >
      <Pressable onPress={onPressBtn} accessibilityLabel={accessibilityLabel}>
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
    </ShadowedElement>
  );
};

export default LottieButtonAnimated;
