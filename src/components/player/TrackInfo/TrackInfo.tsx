import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import type { Track } from 'react-native-track-player';
import Image from 'react-native-fast-image';

import TrackInfoTemplate from './TrackInfoTemplate';
import { useNoxSetting } from '@hooks/useSetting';
import { LyricView } from '../Lyric';

interface Props {
  track?: Track;
  windowWidth?: number;
}
const TrackInfo: React.FC<Props> = ({ track, windowWidth }) => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const [isImageVisible, setIsImageVisible] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;
  const dimension = Dimensions.get('window');
  const albumArtSize =
    windowWidth || Math.min(dimension.width, dimension.height);

  const onImagePress = () => {
    console.log('TrackInfo: Image Clicked - ');
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log('TrackInfo: Setting imagevisible to Image', !isImageVisible);
      setIsImageVisible(false);
    });
  };

  const onLyricPress = () => {
    console.log('TrackInfo: Lyric Clicked - ');
    setIsImageVisible(true);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log('TrackInfo: Setting to Lyric', true);
    });
  };

  return (
    <TrackInfoTemplate>
      <>
        <TouchableWithoutFeedback onPress={onImagePress}>
          <Animated.View
            style={[
              styles.container,
              {
                opacity,
                position: isImageVisible ? 'relative' : 'absolute',
              },
            ]}
            pointerEvents={isImageVisible ? 'auto' : 'none'}
          >
            <Image
              style={[
                styles.artwork,
                { width: albumArtSize, height: albumArtSize },
              ]}
              source={
                playerSetting.hideCoverInMobile
                  ? 0
                  : {
                      uri: `${track?.artwork}`,
                    }
              }
            />
          </Animated.View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={onLyricPress}>
          <View
            style={[
              styles.lyric,
              {
                opacity: isImageVisible ? 0 : 1,
                position: isImageVisible ? 'absolute' : 'relative',
                width: dimension.width,
                height: dimension.height,
              },
            ]}
            pointerEvents={isImageVisible ? 'none' : 'auto'}
          >
            {track && <LyricView track={track} artist="n/a" />}
          </View>
        </TouchableWithoutFeedback>
      </>
    </TrackInfoTemplate>
  );
};

export default TrackInfo;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  artwork: {
    marginTop: 15,
    opacity: 1,
  },
  lyric: {
    opacity: 1,
  },
});
