import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

interface Props {
  onPress?: (toggleSpin: () => void) => void;
  children: React.ReactNode;
  direction?: number;
}

export default function SpinningButton({
  onPress = v => v,
  children,
  direction = 1,
}: Props) {
  const rotation = useSharedValue(0);
  const spinning = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value % 360}deg` }], // modulo keeps it clean
    };
  });

  const spinOnce = () => {
    rotation.value = withTiming(
      rotation.value + 360 * direction,
      { duration: 1000 },
      finished => {
        if (finished && spinning.value) {
          scheduleOnRN(spinOnce); // keep looping
        }
      },
    );
  };

  const toggleSpin = () => {
    if (spinning.value) {
      // Stop spinning
      spinning.value = false;
      cancelAnimation(rotation);
    } else {
      // Start spinning smoothly
      spinning.value = true;
      spinOnce();
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => onPress(toggleSpin)}>
        <Animated.View style={[animatedStyle]}>{children}</Animated.View>
      </Pressable>
      <View style={styles.box} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: { height: 10 },
});
