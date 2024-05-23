import React, { useState } from "react";
import { ImageBackground, Dimensions, View, StyleSheet } from "react-native";
import Video, { VideoRef } from "react-native-video";

import { useNoxSetting } from "@stores/useApp";
import { customReqHeader } from "@utils/BiliFetch";
import { logger } from "@utils/Logger";
import { useIsLandscape } from "@hooks/useOrientation";
import resolveBackgroundImage, {
  RESOLVE_TYPE,
} from "@utils/mediafetch/mainbackgroundfetch";
import EmptyBackground from "./AccentColorBackground";

const MainBackground = ({ children }: { children: React.JSX.Element }) => {
  const playerStyle = useNoxSetting((state) => state.playerStyle);
  const isLandscape = useIsLandscape();
  const { width, height } = Dimensions.get("window");
  const [bkgrdImg, setBkgrdImg] = useState<NoxTheme.backgroundImage>();
  const videoRef = React.useRef<VideoRef | null>(null);
  const bkgrdImgRaw =
    isLandscape && playerStyle.bkgrdImgLandscape
      ? playerStyle.bkgrdImgLandscape
      : playerStyle.bkgrdImg;

  React.useEffect(() => {
    resolveBackgroundImage(bkgrdImgRaw).then(setBkgrdImg);
  }, [bkgrdImgRaw]);

  switch (bkgrdImg?.type) {
    case RESOLVE_TYPE.image:
      return (
        <ImageBackground
          source={{ uri: bkgrdImg.identifier }}
          resizeMode="cover"
          style={[styles.mobileStyle, { height }]}
        >
          <View
            style={{ backgroundColor: playerStyle.colors.background, flex: 1 }}
          >
            {children}
          </View>
        </ImageBackground>
      );
    case RESOLVE_TYPE.video:
      return (
        <>
          <Video
            ref={videoRef}
            source={{
              uri: bkgrdImg.identifier,
              headers: customReqHeader(bkgrdImg.identifier, {}),
            }}
            style={[styles.videoStyle, { width, height }]}
            onError={(e) => {
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
            resizeMode="cover"
            disableFocus={true}
            preventsDisplaySleepDuringVideoPlayback={false}
            bufferConfig={{ cacheSizeMB: 200 }}
          />
          <View
            style={[
              styles.fullscreenStyle,
              { backgroundColor: playerStyle.colors.background },
            ]}
          >
            {children}
          </View>
        </>
      );
    default:
      return <EmptyBackground>{children}</EmptyBackground>;
  }
};

const styles = StyleSheet.create({
  mobileStyle: {
    flex: 1,
  },
  videoStyle: {
    position: "absolute",
  },
  fullscreenStyle: {
    width: "100%",
    height: "100%",
  },
});

export default MainBackground;
