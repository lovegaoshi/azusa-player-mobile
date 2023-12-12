import { View } from 'react-native';
import { useActiveTrack } from 'react-native-track-player';
import { Progress } from './Progress';
import { PlayerControls } from './PlayerControls';
import { useNoxSetting } from '@stores/useApp';
import { styles } from '../style';

export default () => {
  const track = useActiveTrack();
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <View
      style={[
        styles.actionRowContainer,
        { backgroundColor: playerStyle.colors.background },
      ]}
    >
      <Progress live={track?.isLiveStream} />
      <PlayerControls />
    </View>
  );
};
