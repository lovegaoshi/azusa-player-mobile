import React from 'react';
import { ImageBackground, Dimensions, View, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useNoxSetting } from '../../hooks/useSetting';
import { fetchVideoPlayUrlPromise } from '../../utils/mediafetch/resolveURL';
import { customReqHeader } from '../../utils/BiliFetch';
import { biliNFTVideoFetch } from '../../utils/mediafetch/biliNFT';

const mobileHeight = Dimensions.get('window').height;

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
        identifier: await fetchVideoPlayUrlPromise(
          backgroundImage.identifier,
          undefined,
          'VideoUrl'
        ),
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

const MainBackground = (props: any) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  // TODO: are these still necessary since they are behind await initPlayer?
  if (!playerStyle.bkgrdImg) return <>{props.children}</>;

  if (typeof playerStyle.bkgrdImg === 'string') {
    return (
      <ImageBackground
        source={{ uri: playerStyle.bkgrdImg }}
        resizeMode="cover"
        style={styles.mobileStyle}
        {...props}
      >
        {props.children}
      </ImageBackground>
    );
  }

  switch (playerStyle.bkgrdImg.type) {
    case RESOLVE_TYPE.image:
      return (
        <ImageBackground
          source={{ uri: playerStyle.bkgrdImg.identifier }}
          resizeMode="cover"
          style={styles.mobileStyle}
          {...props}
        >
          {props.children}
        </ImageBackground>
      );
    case RESOLVE_TYPE.video:
      console.log(playerStyle.bkgrdImg.identifier);
      return (
        <>
          <Video
            source={{
              uri: playerStyle.bkgrdImg.identifier,
              headers: customReqHeader(playerStyle.bkgrdImg.identifier, {}),
            }}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            isLooping
            resizeMode={ResizeMode.COVER}
            volume={0}
            shouldPlay={true}
          />
          <View style={styles.fullscreenStyle}>{props.children}</View>
        </>
      );
    default:
      return <>{props.children}</>;
  }
};

const styles = StyleSheet.create({
  mobileStyle: {
    flex: 1,
    height: mobileHeight,
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
