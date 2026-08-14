import TrackPlayer from 'react-native-track-player';
import { View, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

import { PaperText as Text } from '@components/commonui/ScaledText';

export default () => {
  return (
    <View>
      <Text>TP.Volume Slider</Text>
      <Slider
        style={styles.volumeSlider}
        onValueChange={volume => TrackPlayer.setAnimatedVolume({ volume })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  volumeSlider: { width: '100%', height: 30 },
});
