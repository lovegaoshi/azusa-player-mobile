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

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    zIndex: visible ? 1 : -1,
    position: 'absolute',
    bottom: dimension.height - dimension.width - 200 + insets.bottom,
    width: '100%',
  }));

  useFocusEffect(
    useCallback(() => {
      if (playerSetting.screenAlwaysWake && visible) {
        console.log(`screen mount?, ${visible}`);
        activateKeepAwakeAsync();
        return deactivateKeepAwake;
      }
      return () => undefined;
    }, [visible, playerSetting.screenAlwaysWake]),
  );
  if (!visible || !track) {
    return <></>;
  }
  return (
    <Animated.View style={[animatedStyle, style]}>
      <LyricView
        track={track}
        artist="n/a"
        onPress={onPress}
        height={dimension.width + 100}
        style={{}}
      />
    </Animated.View>
  );
}
