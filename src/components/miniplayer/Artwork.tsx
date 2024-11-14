import { TouchableWithoutFeedback, Dimensions } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';

import { styles } from '../style';
import useActiveTrack from '@hooks/useActiveTrack';
import { MinPlayerHeight } from './Constants';
import { useNoxSetting } from '@stores/useApp';
import { songResolveArtwork } from '@utils/mediafetch/resolveURL';

interface Props extends NoxComponent.MiniplayerProps {
  opacity: SharedValue<number>;
  onPress: () => void;
  expand: () => void;
}

export default ({ miniplayerHeight, opacity, onPress, expand }: Props) => {
  const { track } = useActiveTrack();
  const { hideCoverInMobile } = useNoxSetting(state => state.playerSetting);
  const [overwriteAlbumArt, setOverwriteAlbumArt] = useState<string | void>();
  const { width } = Dimensions.get('window');

  const artworkWidth = useDerivedValue(() => {
    return Math.min(miniplayerHeight.value - 25, width);
  });
  const artworkBottom = useDerivedValue(() => {
    const val = miniplayerHeight.value - MinPlayerHeight - 5;
    const overflowBottom = Math.max(0, miniplayerHeight.value - 90 - width);
    return Math.min(val - overflowBottom);
  });
  const artworkLeft = useDerivedValue(() => {
    const val = 5 + MinPlayerHeight - miniplayerHeight.value;
    if (val < 0) return 0;
    return val;
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: artworkWidth.value,
      height: artworkWidth.value,
      bottom: -artworkBottom.value,
      left: artworkLeft.value,
      opacity: opacity.value,
      zIndex: opacity.value > 0 ? 1 : -1,
    };
  });

  const onImagePress = () => {
    if (miniplayerHeight.value === MinPlayerHeight) {
      return expand();
    }
    if (artworkWidth.value === width) {
      return onPress();
    }
  };

  useEffect(() => {
    songResolveArtwork(track?.song)?.then(setOverwriteAlbumArt);
  }, [track]);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
        },
        animatedStyle,
      ]}
    >
      <TouchableWithoutFeedback onPress={onImagePress}>
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
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};
