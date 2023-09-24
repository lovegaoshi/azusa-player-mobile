import { View } from 'react-native';
import { useActiveTrack } from 'react-native-track-player';

import TrackInfoTemplate from '../player/TrackInfo/TrackInfoTemplate';
import LandscapePlayerProgress from './LandscapePlayerProgress';

interface Props {
  panelWidth: number;
}
export default ({ panelWidth }: Props) => {
  const track = useActiveTrack();
  return (
    <View>
      <TrackInfoTemplate track={track} windowWidth={panelWidth} />
      <LandscapePlayerProgress panelWidth={panelWidth} />
    </View>
  );
};
