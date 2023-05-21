import { ImageBackground, Dimensions, View } from 'react-native';
import Video from 'react-native-video';
import { useNoxSetting } from '../../hooks/useSetting';
import { fetchVideoPlayUrlPromise } from '../../utils/Data';
import React from 'react';

const mobileHeight = Dimensions.get('window').height;

enum RESOLVE_TYPE {
  bvid = 'bvid',
  video = 'video',
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
    default:
      return backgroundImage;
  }
};

export default (props: any) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  // TODO: are these still necessary since they are behind await initPlayer?
  if (!playerStyle.bkgrdImg) return <>{props.children}</>;

  if (typeof playerStyle.bkgrdImg === 'string') {
    return (
      <ImageBackground
        source={{ uri: playerStyle.bkgrdImg }}
        resizeMode="cover"
        style={{ flex: 1, height: mobileHeight }}
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
          style={{ flex: 1, height: mobileHeight }}
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
            source={{ uri: playerStyle.bkgrdImg.identifier }}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            repeat={true}
            muted={true}
            rate={1}
            resizeMode="cover"
          />
          <View style={{ width: '100%', height: '100%' }}>
            {props.children}
          </View>
        </>
      );
    default:
      return <>{props.children}</>;
  }
};
