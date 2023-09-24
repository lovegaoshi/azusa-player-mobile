import { View } from 'react-native';
import { useActiveTrack } from 'react-native-track-player';
import { Progress } from '@components/player/Progress';
import PlayerControls from './PlayerControlsSquared';
import { useNoxSetting } from '@hooks/useSetting';

interface Props {
  panelWidth: number;
}
export default ({ panelWidth }: Props) => {
  const track = useActiveTrack();
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <View
      style={[
        playerStyle.actionRowContainer,
        {
          backgroundColor: playerStyle.colors.background,
          width: panelWidth,
        },
      ]}
    >
      <Progress live={track?.isLiveStream} />
      <PlayerControls panelWidth={panelWidth} />
    </View>
  );
};
