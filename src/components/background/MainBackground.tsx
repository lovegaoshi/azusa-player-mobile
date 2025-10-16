import React, { useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Video, { VideoRef, ResizeMode } from 'react-native-video';
import { Image } from 'expo-image';

import { useNoxSetting } from '@stores/useApp';
import { customReqHeader } from '@utils/BiliFetch';
import { logger } from '@utils/Logger';
import { useIsLandscape } from '@hooks/useOrientation';
import resolveBackgroundImage, {
  RESOLVE_TYPE,
} from '@utils/mediafetch/mainbackgroundfetch';
import EmptyBackground from './AccentColorBackground';
import useTrackMV from '@hooks/useTrackMV';

const MainBackground = () => {
  const insets = useSafeAreaInsets();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const isLandscape = useIsLandscape();
  const { width, height } = Dimensions.get('window');
  const [bkgrdImg, setBkgrdImg] = useState<NoxTheme.BackgroundImage>();
  const videoRef = React.useRef<VideoRef | null>(null);
  const trackMV = useTrackMV(videoRef);
  const bkgrdImgRaw =
    isLandscape && playerStyle.bkgrdImgLandscape
      ? playerStyle.bkgrdImgLandscape
      : playerStyle.bkgrdImg;

  React.useEffect(() => {
    resolveBackgroundImage(trackMV ?? bkgrdImgRaw).then(setBkgrdImg);
  }, [trackMV, bkgrdImgRaw]);

  switch (bkgrdImg?.type) {
    case RESOLVE_TYPE.image:
      return (
        <Image
          source={{ uri: bkgrdImg.identifier }}
          contentFit="cover"
          style={[
            styles.mobileStyle,
            { height: height + insets.bottom + insets.top + 20, width: width },
          ]}
        />
      );
    case RESOLVE_TYPE.video:
      return (
        <Video
          enterPictureInPictureOnLeave={false}
          ref={videoRef}
          source={{
            uri: bkgrdImg.identifier,
            headers: customReqHeader(bkgrdImg.identifier, {}),
            bufferConfig: { cacheSizeMB: 200 },
          }}
          style={[
            styles.videoStyle,
            { width, height: height + insets.bottom + insets.top },
          ]}
          onError={e => {
            logger.error(JSON.stringify(e));
            logger.error(
              `with: ${bkgrdImg.identifier} + ${JSON.stringify(customReqHeader(bkgrdImg.identifier, {}))}`,
            );
          }}
          onEnd={
            bkgrdImg.toA
              ? () => {
                  // HACK: for a toA functioanlity we have 2 solutions. one is to
                  // do like this; the other is to keep in loop, but change src.
                  // ofc the latter is more smooth but meh I dont have two srcs prepared
                  videoRef.current?.seek(bkgrdImg.toA!);
                  videoRef.current?.resume();
                }
              : undefined
          }
          repeat={bkgrdImg.toA ? false : true}
          muted
          resizeMode={ResizeMode.COVER}
          disableFocus={true}
          preventsDisplaySleepDuringVideoPlayback={false}
          controls={false}
        />
      );
    default:
      return <EmptyBackground />;
  }
};

const styles = StyleSheet.create({
  mobileStyle: {
    position: 'absolute',
    flex: 1,
    width: '100%',
    height: '100%',
  },
  videoStyle: {
    position: 'absolute',
  },
  fullscreenStyle: {
    width: '100%',
    height: '100%',
  },
});

export default MainBackground;
