import React, { useState } from 'react';
import { View, ViewStyle } from 'react-native';

import { styles } from '@components/style';
import { useMiniplayerHeight } from '@contexts/MiniPlayerHeightContext';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { MinPlayerHeight } from '../miniplayer/Constants';

interface Props {
  children: React.JSX.Element;
  noFlex?: boolean;
  style?: ViewStyle;
  mkey?: string;
}
/**
 * a view of flex:1 for new arch, resolves resizing issues
 */
export default ({ children, style }: Props) => {
  const [initHeight, setInitHeight] = useState(0);
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
        if (miniplayerHeight.value <= MinPlayerHeight) {
          setInitHeight(e.nativeEvent.layout.height);
        }
      }}
    >
      {children}
    </Animated.View>
  );
};
