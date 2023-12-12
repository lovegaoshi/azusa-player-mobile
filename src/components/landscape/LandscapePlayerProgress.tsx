import { View } from 'react-native';
import { useActiveTrack } from 'react-native-track-player';
import { Progress } from '@components/player/controls/Progress';
import PlayerControls from './PlayerControlsSquared';
import { useNoxSetting } from '@stores/useApp';
import { styles } from '../style';

interface Props {
  panelWidth: number;
}
export default ({ panelWidth }: Props) => {
  const track = useActiveTrack();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const iconSize = (panelWidth * 0.6) / 5;

  return (
    <View
      style={[
        styles.actionRowContainer,
        {
          backgroundColor: playerStyle.colors.background,
          width: panelWidth,
          height: iconSize + 78,
        },
      ]}
    >
      <Progress live={track?.isLiveStream} />
      <PlayerControls iconSize={iconSize} />
    </View>
  );
};
