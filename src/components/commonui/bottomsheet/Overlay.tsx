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
  onRequestClose?: () => void;
}

type OverlayProps = Props & { transparent?: boolean };

// FullWindowOverlay (iOS) and Modal (Android) share only a subset of props.
const OverlayComponent =
  Overlay as unknown as React.ComponentType<OverlayProps>;

export default (p: Props) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(p.visible ? 1 : 0, { duration: 200 }),
  }));
  return (
    <OverlayComponent
      visible={p.visible}
      transparent
      // RN's Android Modal requires this to handle back presses.
      {...(Platform.OS !== 'ios'
        ? { onRequestClose: p.onRequestClose ?? (() => undefined) }
        : {})}
    >
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        {p.children}
      </Animated.View>
    </OverlayComponent>
  );
};
