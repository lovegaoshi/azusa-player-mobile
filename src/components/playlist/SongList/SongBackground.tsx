import React from 'react';
import { StyleSheet, ImageBackground } from 'react-native';
import { i0hdslbHTTPResolve } from '@utils/Utils';

interface Props {
  song: NoxMedia.Song;
  current?: boolean;
  children: React.JSX.Element;
}
const SongBackground = ({ song, current, children }: Props) => {
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
