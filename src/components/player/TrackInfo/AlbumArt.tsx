import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import type { Track } from 'react-native-track-player';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import { useNoxSetting } from '@stores/useApp';
import { LyricView } from '../Lyric';
import { songResolveArtwork } from '@utils/mediafetch/resolveURL';

interface Props {
  track?: Track;
  windowWidth?: number;
  windowHeight?: number;
  albumArtStyle?: NoxComponent.ViewStyleProp;
  lyricStyle?: NoxComponent.ViewStyleProp;
}
const AlbumArt: React.FC<Props> = ({
  track,
  windowWidth,
  windowHeight,
  albumArtStyle,
  lyricStyle,
}) => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const [isImageVisible, setIsImageVisible] = useState(true);
  const [isLrcVisible, setIsLrcVisible] = useState(false);
  const [overwriteAlbumArt, setOverwriteAlbumArt] = useState<string>();
  const opacity = useRef(new Animated.Value(1)).current;
  const dimension = Dimensions.get('window');
  const coverStyle = {
    width: windowWidth ?? '100%',
    height: windowHeight ?? '100%',
  };

  const onImagePress = () => {
    console.log('TrackInfo: Image Clicked - ');
    setIsLrcVisible(true);
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
    setIsLrcVisible(false);
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

  useFocusEffect(
    React.useCallback(() => {
      if (playerSetting.screenAlwaysWake && !isImageVisible) {
        console.log(`screen mount?, ${isImageVisible}`);
        activateKeepAwakeAsync();
        return deactivateKeepAwake;
      }
      return () => undefined;
    }, [isImageVisible, playerSetting.screenAlwaysWake])
  );

  useEffect(() => {
    songResolveArtwork(track?.song)?.then(setOverwriteAlbumArt);
  }, [track]);

  return (
    <>
      <TouchableWithoutFeedback onPress={onImagePress}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity,
              position: isImageVisible ? 'relative' : 'absolute',
            },
            albumArtStyle,
          ]}
          pointerEvents={isImageVisible ? 'auto' : 'none'}
        >
          <Image
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            style={[styles.artwork, coverStyle]}
            source={
              playerSetting.hideCoverInMobile
                ? 0
                : {
                  uri: `${overwriteAlbumArt ?? track?.artwork}`,
                }
            }
          />
        </Animated.View>
      </TouchableWithoutFeedback>
      <View
        style={[
          styles.lyric,
          {
            opacity: isImageVisible ? 0 : 1,
            position: !isLrcVisible ? 'absolute' : 'relative',
            width: dimension.width,
            height: dimension.height,
          },
          lyricStyle,
        ]}
        pointerEvents={isImageVisible ? 'none' : 'auto'}
      >
        {track && (
          <LyricView
            track={track}
            artist="n/a"
            onPress={onLyricPress}
            height={dimension.height / 2 + 100}
            visible={isLrcVisible}
          />
        )}
      </View>
    </>
  );
};

export default AlbumArt;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  artwork: {
    opacity: 1,
  },
  lyric: {
    opacity: 1,
  },
});
