import React from 'react';
import { useActiveTrack } from 'react-native-track-player';

import AlbumArt from '../player/TrackInfo/AlbumArt';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  panelStyle?: any;
}
const LandscapeLyricView = React.memo(({ panelStyle }: Props) => {
  const track = useActiveTrack();

  return track ? <AlbumArt track={track} lyricStyle={panelStyle} /> : <></>;
});

export default LandscapeLyricView;
