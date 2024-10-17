import React from 'react';
import { StyleSheet } from 'react-native';
import Video from 'react-native-video';

import { useNoxSetting } from '@stores/useApp';

export default () => {
  const shawarmaVoice = useNoxSetting(state => state.shawarmaVoice);

  return (
    <Video
      source={{ uri: shawarmaVoice }}
      style={styles.videoStyle}
      disableFocus={true}
      preventsDisplaySleepDuringVideoPlayback={false}
      bufferConfig={{ cacheSizeMB: 200 }}
      onLoadStart={() => {
        console.log('video onLoadStart');
      }}
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
