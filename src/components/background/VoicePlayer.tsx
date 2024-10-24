import React from 'react';
import { StyleSheet } from 'react-native';
import Video from 'react-native-video';

export default ({ uri }: { uri: string | NodeRequire | undefined }) => {
  return (
    <Video
      source={{ uri }}
      style={styles.videoStyle}
      disableFocus={true}
      preventsDisplaySleepDuringVideoPlayback={false}
    />
  );
};
const styles = StyleSheet.create({
  videoStyle: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
});
