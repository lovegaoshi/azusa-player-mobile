import {
  usePlaybackState,
  State,
  usePlayWhenReady,
} from 'react-native-track-player';
import { useDebouncedValue } from 'hooks';
import { ActivityIndicator, IconButton, Text } from 'react-native-paper';
import { View, TouchableWithoutFeedback, Dimensions } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';

import { fadePause, fadePlay } from '@utils/RNTPUtils';
import useTPControls from '@hooks/useTPControls';
import { styles } from '../style';
import useActiveTrack from '@hooks/useActiveTrack';
import { MinPlayerHeight } from './Constants';
import { useNoxSetting } from '@stores/useApp';
import { songResolveArtwork } from '@utils/mediafetch/resolveURL';

const IconSize = 30;
const iconContainerStyle = { width: IconSize + 16, height: IconSize + 16 };
const DoublePlayerHeight = MinPlayerHeight * 1.2;

export default ({ miniplayerHeight }: NoxComponent.MiniplayerProps) => {
  const { track } = useActiveTrack();
  const { screenAlwaysWake, hideCoverInMobile } = useNoxSetting(
    state => state.playerSetting,
  );
  const [overwriteAlbumArt, setOverwriteAlbumArt] = useState<string | void>();
  const { width, height } = Dimensions.get('window');

  const artworkWidth = useDerivedValue(() => {
    return Math.min(miniplayerHeight.value - 25, width);
  });
  const artworkBottom = useDerivedValue(() => {
    const val = miniplayerHeight.value - MinPlayerHeight;
    const overflowBottom = Math.max(0, miniplayerHeight.value - 25 - width);
    return val - overflowBottom;
  });
  const artworkLeft = useDerivedValue(() => {
    const val = 5 + MinPlayerHeight - miniplayerHeight.value;
    if (val < 0) return 0;
    return val;
  });

  const artworkStyle = useAnimatedStyle(() => {
    return {
      width: artworkWidth.value,
      height: artworkWidth.value,
      bottom: -artworkBottom.value,
      left: artworkLeft.value,
    };
  });

  useEffect(() => {
    songResolveArtwork(track?.song)?.then(setOverwriteAlbumArt);
  }, [track]);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
        },
        artworkStyle,
      ]}
    >
      <Image
        style={styles.flex}
        source={
          hideCoverInMobile
            ? 0
            : {
                uri: `${overwriteAlbumArt ?? track?.artwork}`,
              }
        }
      />
    </Animated.View>
  );
};
