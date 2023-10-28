import React from 'react';
import {
  ImageBackground,
  Dimensions,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
// import Video from 'react-native-video';
import { useNoxSetting } from '@hooks/useSetting';
import { fetchVideoPlayUrlPromise } from '@utils/mediafetch/bilivideo';
import { customReqHeader } from '@utils/BiliFetch';
import { biliNFTVideoFetch } from '@utils/mediafetch/biliNFT';
import { logger } from '@utils/Logger';
import { useIsLandscape } from '@hooks/useOrientation';

enum RESOLVE_TYPE {
  bvid = 'bvid',
  video = 'video',
  biliNFTVideo = 'biliNFTVideo',
  image = 'image',
}

export const resolveBackgroundImage = async (
  backgroundImage: string | NoxTheme.backgroundImage
) => {
  if (typeof backgroundImage === 'string') {
    return { type: RESOLVE_TYPE.image, identifier: backgroundImage };
  }
  switch (backgroundImage.type) {
    case RESOLVE_TYPE.bvid:
      return {
        type: RESOLVE_TYPE.video,
        identifier: (
          await fetchVideoPlayUrlPromise({
            bvid: backgroundImage.identifier,
            extractType: 'VideoUrl',
            iOS: Platform.OS === 'ios',
          })
        ).url,
      };
    case RESOLVE_TYPE.biliNFTVideo:
      // eslint-disable-next-line no-case-declarations
      const [act_id, index] = JSON.parse(backgroundImage.identifier);
      return {
        type: RESOLVE_TYPE.video,
        identifier: await biliNFTVideoFetch({ act_id, index }),
      };
    default:
      return backgroundImage;
  }
};

const MainBackground = (props: { children: React.JSX.Element }) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const isLandscape = useIsLandscape();
  const mobileHeight = Dimensions.get('window').height;
  const bkgrdImg =
    isLandscape && playerStyle.bkgrdImgLandscape
      ? playerStyle.bkgrdImgLandscape
      : playerStyle.bkgrdImg;

  // TODO: are these still necessary since they are behind await initPlayer?
  if (!bkgrdImg) return <>{props.children}</>;

  if (typeof bkgrdImg === 'string') {
    return (
      <ImageBackground
        source={{ uri: bkgrdImg }}
        resizeMode="cover"
        style={[styles.mobileStyle, { height: mobileHeight }]}
      >
        <View
          style={{ backgroundColor: playerStyle.colors.background, flex: 1 }}
        >
          {props.children}
        </View>
      </ImageBackground>
    );
  }

  switch (bkgrdImg.type) {
    case RESOLVE_TYPE.image:
      return (
        <ImageBackground
          source={{ uri: bkgrdImg.identifier }}
          resizeMode="cover"
          style={[styles.mobileStyle, { height: mobileHeight }]}
        >
          <View
            style={{ backgroundColor: playerStyle.colors.background, flex: 1 }}
          >
            {props.children}
          </View>
        </ImageBackground>
      );
    case RESOLVE_TYPE.video:
      return (
        <>
          <Video
            source={{
              uri: bkgrdImg.identifier,
              headers: customReqHeader(bkgrdImg.identifier, {}),
            }}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            onError={logger.error}
            isLooping
            resizeMode={ResizeMode.COVER}
            shouldPlay={true}
            isMuted={true}
            /**
            repeat
            muted
            resizeMode="cover"
            preventsDisplaySleepDuringVideoPlayback={false}
             *
             */
          />
          <View
            style={[
              styles.fullscreenStyle,
              { backgroundColor: playerStyle.colors.background },
            ]}
          >
            {props.children}
          </View>
        </>
      );
    default:
      return <>{props.children}</>;
  }
};

const styles = StyleSheet.create({
  mobileStyle: {
    flex: 1,
  },
  videoStyle: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  fullscreenStyle: {
    width: '100%',
    height: '100%',
  },
});

export default MainBackground;
