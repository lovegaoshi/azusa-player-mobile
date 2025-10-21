import React from 'react';
import { StyleSheet } from 'react-native';
import Video from 'react-native-video';

interface Props {
  uri: string | NodeRequire | undefined;
}
export default function VoicePlayer({ uri }: Props) {
  return (
    <Video
      source={{ uri }}
      style={styles.videoStyle}
      disableFocus={true}
      preventsDisplaySleepDuringVideoPlayback={false}
      controls={false}
    />
  );
}
const styles = StyleSheet.create({
  videoStyle: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
});
