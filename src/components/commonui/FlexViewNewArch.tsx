import React, { useRef, useState } from 'react';
import { View, ViewStyle } from 'react-native';

import { styles } from '@components/style';
import { isOldArch } from '@utils/RNUtils';
import { useMiniplayerHeight } from '@contexts/MiniPlayerHeightContext';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { MinPlayerHeight } from '../miniplayer/Constants';

interface Props {
  children: React.JSX.Element;
  noFlex?: boolean;
  style?: ViewStyle;
}
/**
 * a view of flex:1 for new arch, resolves resizing issues
 */
export default ({ children, noFlex, style }: Props) => {
  // do NOT change noFlex OTF.
  if (isOldArch() && !noFlex) {
    return <View style={[styles.flex, style]}>{children}</View>;
  }

  const [initHeight, setInitHeight] = useState(0);
  const largestHeight = useRef(-1);
  const miniplayerHeight = useMiniplayerHeight();

  const animatedStyle = useAnimatedStyle(() => {
    if (miniplayerHeight.value < MinPlayerHeight) {
      return { flex: 1, height: undefined };
    }
    return {};
  });

  return (
    <Animated.View
      style={[
        initHeight === 0 ? styles.flex : { height: initHeight },
        style,
        animatedStyle,
      ]}
      onLayout={e => {
        if (initHeight > 0 || e.nativeEvent.layout.height === 0) {
          return;
        }
        if (largestHeight.current < e.nativeEvent.layout.height) {
          largestHeight.current = e.nativeEvent.layout.height;
          return;
        }
        setInitHeight(largestHeight.current);
      }}
    >
      {children}
    </Animated.View>
  );
};
