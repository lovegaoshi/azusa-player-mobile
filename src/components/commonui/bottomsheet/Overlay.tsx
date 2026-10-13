import React from 'react';
import { Platform, Modal } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { FullWindowOverlay } from 'react-native-screens';

/**
 * overlay modals/dialogs on top of true-sheet.
 * https://sheet.lodev09.com/guides/overlays
 */

export const Overlay = Platform.select({
  ios: FullWindowOverlay,
  // @ts-expect-error
  default: Modal,
});

interface Props extends React.PropsWithChildren {
  visible?: boolean;
}

export default (p: Props) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(p.visible ? 1 : 0, { duration: 200 }),
  }));
  return (
    // @ts-expect-error
    <Overlay visible={p.visible} transparent>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        {p.children}
      </Animated.View>
    </Overlay>
  );
};
