import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Dimensions, ViewStyle } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import React, { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTrackStore } from '@hooks/useActiveTrack';
import { LyricView } from '../player/Lyric';
import { useNoxSetting } from '@stores/useApp';

interface Props extends NoxComponent.OpacityProps {
  visible: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export default function MiniplayerLrc({
  visible,
  onPress,
  opacity,
  style,
}: Props) {
  const insets = useSafeAreaInsets();
  const track = useTrackStore(s => s.track);
  const dimension = Dimensions.get('window');
  const playerSetting = useNoxSetting(state => state.playerSetting);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const lrcStyle: ViewStyle = {
    zIndex: visible ? 1 : -1,
    opacity: 0,
    position: 'absolute',
    bottom: dimension.height - dimension.width - 200 + insets.bottom,
    width: '100%',
  };

  useFocusEffect(
    useCallback(() => {
      if (playerSetting.screenAlwaysWake && visible) {
        activateKeepAwakeAsync();
        return deactivateKeepAwake;
      }
      return () => undefined;
    }, [visible, playerSetting.screenAlwaysWake]),
  );

  return (
    <Animated.View style={[animatedStyle, lrcStyle, style]}>
      <LyricView
        track={track}
        artist="n/a"
        onPress={onPress}
        height={dimension.width + 100}
        style={{}}
        visible={visible}
      />
    </Animated.View>
  );
}
