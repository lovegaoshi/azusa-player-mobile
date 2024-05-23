import React from "react";
import { StyleSheet, ImageBackground } from "react-native";

import { i0hdslbHTTPResolve } from "@utils/Utils";
import { useNoxSetting } from "@stores/useApp";

interface Props {
  song: NoxMedia.Song;
  children: React.JSX.Element;
}
const SongBackground = ({ song, children }: Props) => {
  const currentPlayingId = useNoxSetting((state) => state.currentPlayingId);
  const playerSetting = useNoxSetting((state) => state.playerSetting);
  const current =
    playerSetting.trackCoverArtCard && song.id === currentPlayingId;

  return current ? (
    <ImageBackground
      source={{ uri: i0hdslbHTTPResolve(song.cover) }}
      resizeMode="cover"
      style={stylesLocal.songInfoBackgroundBanner}
      imageStyle={stylesLocal.songInfoBackgroundImg}
    >
      {children}
    </ImageBackground>
  ) : (
    children
  );
};

const stylesLocal = StyleSheet.create({
  songInfoBackgroundImg: { opacity: 0.5 },
  songInfoBackgroundBanner: { flex: 1 },
});

export default SongBackground;
