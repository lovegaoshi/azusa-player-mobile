import { TouchableWithoutFeedback, Dimensions } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
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
  const artworkScale = useDerivedValue(() => {
    return artworkWidth.value / width;
  });
  const expandDiff = useDerivedValue(
    () => miniplayerHeight.value - MinPlayerHeight,
  );

  const artworkTranslateY = useDerivedValue(() => {
    return Math.min(100, 165 + MinPlayerHeight - width + expandDiff.value / 2);
  });
  const artworkTranslateX = useDerivedValue(() => {
    if (expandDiff.value < 6) {
      return 5 - expandDiff.value + (artworkWidth.value - width) / 2;
    }
    return (artworkWidth.value - width) / 2;
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: artworkTranslateX.value },
        { translateY: artworkTranslateY.value },
        { scaleX: artworkScale.value },
        { scaleY: artworkScale.value },
      ],
      opacity: opacity.value,
      zIndex: opacity.value > 0 ? 1 : -1,
    };
  });

  const onImagePress = () => {
    if (miniplayerHeight.value === MinPlayerHeight) {
      return expand();
    }
    if (artworkScale.value === 1) {
      return onPress();
    }
  };

  useEffect(() => {
    songResolveArtwork(track?.song)?.then(setOverwriteAlbumArt);
  }, [track]);

  return (
    <TouchableWithoutFeedback onPress={onImagePress}>
      <Animated.Image
        style={[
          styles.flex,
          {
            width,
            height: width,
            position: 'absolute',
          },
          animatedStyle,
        ]}
        source={
          hideCoverInMobile
            ? 0
            : {
                uri: `${overwriteAlbumArt ?? track?.artwork}`,
              }
        }
      />
    </TouchableWithoutFeedback>
  );
};
