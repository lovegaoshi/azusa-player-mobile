import { useActiveTrack } from 'react-native-track-player';
import TrackInfoTemplate from '../player/TrackInfo/TrackInfoTemplate';

interface Props {
  panelWidth: number;
}
export default ({ panelWidth }: Props) => {
  const track = useActiveTrack();
  return <TrackInfoTemplate track={track} windowWidth={panelWidth} />;
};
