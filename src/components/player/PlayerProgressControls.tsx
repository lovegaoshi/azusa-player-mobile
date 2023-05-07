import { View } from 'react-native';
import { useActiveTrack } from 'react-native-track-player';
import { Progress } from './Progress';
import { PlayerControls } from './PlayerControls';
import { styles } from '../style';

export default () => {
  const track = useActiveTrack();
  return (
    <View style={styles.actionRowContainer}>
      <Progress live={track?.isLiveStream} />
      <PlayerControls />
    </View>
  );
};
