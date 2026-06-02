import React, { useState } from 'react';
import { Dimensions, StyleSheet, AppState } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEventListener } from 'expo';

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
  const bkgrdImgRaw =
    isLandscape && playerStyle.bkgrdImgLandscape
      ? playerStyle.bkgrdImgLandscape
      : playerStyle.bkgrdImg;
  const player = useVideoPlayer({ useCaching: true }, player => {
    player.audioMixingMode = 'mixWithOthers';
    player.volume = 0;
    player.loop = true;
  });
  const { parsedMV: trackMV, primeVideoPosition } = useTrackMV(player);

  React.useEffect(() => {
    resolveBackgroundImage(trackMV ?? bkgrdImgRaw).then(bkgrd => {
      setBkgrdImg(bkgrd);
      if (bkgrd?.type === RESOLVE_TYPE.video) {
        player
          .replaceAsync({
            uri: bkgrd.identifier,
            headers: customReqHeader(bkgrd.identifier, {}),
            useCaching: true,
          })
          .then(() => {
            player.loop = bkgrd.toA ? false : true;
            player.play();
          });
      }
    });
  }, [trackMV, bkgrdImgRaw]);

  useEventListener(player, 'playToEnd', () => {
    if (bkgrdImg?.toA) {
      player.currentTime = bkgrdImg.toA;
      player.play();
    }
  });

  useEventListener(player, 'statusChange', status => {
    if (status.error) {
      logger.error(
        `[MainBackground] Video error: ${status.error} while playing ${bkgrdImg?.identifier}`,
      );
    }
  });

  React.useEffect(
    AppState.addEventListener('change', nextAppState => {
      if (nextAppState !== 'active') {
        return;
      }
      player.play();
      primeVideoPosition();
    }).remove,
    [],
  );

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
        <VideoView
          player={player}
          style={[
            styles.videoStyle,
            { width, height: height + insets.bottom + insets.top },
          ]}
          contentFit="cover"
          buttonOptions={{
            showBottomBar: false,
            showPlayPause: false,
            showSeekBackward: false,
            showSeekForward: false,
            showSettings: false,
          }}
          nativeControls={false}
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
