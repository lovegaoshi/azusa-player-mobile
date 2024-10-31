import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import { View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type CollapsibleProps = PropsWithChildren<{
  collapsed: boolean;
  style?: ViewStyle;
  collapsedHeight?: number;
  testID?: string;
  pinTo?: 'top' | 'bottom'; // Use 'top' to ensure the top of the content is always visible when partially collapsed
  renderChildrenCollapsed?: boolean;
}>;

const ANIMATION_CONFIG = {
  duration: 300,
  easing: Easing.bezier(0.4, 0.0, 0.2, 1),
};

export const Collapsible = ({
  collapsed,
  children,
  style,
  collapsedHeight,
  testID,
  pinTo = 'top',
  renderChildrenCollapsed = true,
}: CollapsibleProps) => {
  const sharedValue = useSharedValue(0);
  const [bodySectionHeight, setBodySectionHeight] = useState<null | number>(
    null,
  );

  const [showTheKids, setShowTheKids] = useState(true);
  const initialHeight = collapsedHeight ?? 0;

  const bodyHeight = useAnimatedStyle(() => ({
    height: interpolate(
      sharedValue.value,
      [initialHeight ?? 0, 1],
      [initialHeight, bodySectionHeight ?? initialHeight],
    ),
  }));

  const onAnimationEnd = useCallback(() => {
    if (collapsed && !renderChildrenCollapsed) {
      setShowTheKids(false);
    }
  }, [collapsed, renderChildrenCollapsed]);

  const toggleCollapsed = useCallback(
    (isCollapsed: CollapsibleProps['collapsed']) => {
      const nextValue = isCollapsed ? initialHeight : 1;

      if (!isCollapsed && !showTheKids) {
        setShowTheKids(true);
      }

      sharedValue.value = withTiming(nextValue, ANIMATION_CONFIG, didFinish => {
        if (!didFinish) {
          return;
        }

        runOnJS(onAnimationEnd)();
      });
    },
    [initialHeight, showTheKids, sharedValue, onAnimationEnd],
  );

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (bodySectionHeight !== null) {
        return;
      }

      setBodySectionHeight(event.nativeEvent.layout.height);
    },
    [bodySectionHeight],
  );

  useEffect(() => {
    toggleCollapsed(collapsed);
  }, [collapsed, toggleCollapsed]);

  return (
    <Animated.View style={[{ overflow: 'hidden' }, bodyHeight]}>
      <View
        style={[{ position: 'absolute', [pinTo]: 0, left: 0, right: 0 }, style]}
        onLayout={handleLayout}
      >
        {showTheKids && children}
      </View>
    </Animated.View>
  );
};
