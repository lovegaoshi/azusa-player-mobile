import React from 'react';
import { StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

interface Props {
  uri: number | undefined;
}
export default function VoicePlayer({ uri }: Props) {
  const player = useVideoPlayer({ assetId: uri }, player => {
    player.audioMixingMode = 'mixWithOthers';
    player.keepScreenOnWhilePlaying = false;
  });

  React.useEffect(() => {
    player.replaceAsync({ assetId: uri }).then(() => player.play());
  }, [uri]);

  return <VideoView player={player} style={styles.videoStyle} />;
}
const styles = StyleSheet.create({
  videoStyle: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
});
