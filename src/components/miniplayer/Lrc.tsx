import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useCallback } from 'react';

import useActiveTrack from '@hooks/useActiveTrack';
import { LyricView } from '../player/Lyric';
import { useNoxSetting } from '@stores/useApp';

interface Props extends NoxComponent.OpacityProps {
  visible: boolean;
  onPress: () => void;
}

export default ({ visible, onPress, opacity }: Props) => {
  const { track } = useActiveTrack();
  const dimension = Dimensions.get('window');
  const { screenAlwaysWake } = useNoxSetting(state => state.playerSetting);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    zIndex: visible ? 1 : -1,
    position: 'absolute',
    bottom: 300,
  }));

  useFocusEffect(
    useCallback(() => {
      if (screenAlwaysWake && visible) {
        console.log(`screen mount?, ${visible}`);
        activateKeepAwakeAsync();
        return deactivateKeepAwake;
      }
      return () => undefined;
    }, [visible, screenAlwaysWake]),
  );
  if (!visible || !track) {
    return <></>;
  }
  return (
    <Animated.View style={animatedStyle}>
      <LyricView
        track={track}
        artist="n/a"
        onPress={onPress}
        height={dimension.height / 2}
        style={{}}
      />
    </Animated.View>
  );
};
