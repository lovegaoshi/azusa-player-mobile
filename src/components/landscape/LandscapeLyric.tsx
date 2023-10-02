import React, { useState } from 'react';
import TrackPlayer, { Track } from 'react-native-track-player';

import { useNoxSetting } from '@hooks/useSetting';
import AlbumArt from '../player/TrackInfo/AlbumArt';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  panelStyle?: any;
}
const LandscapeLyricView = ({ panelStyle }: Props) => {
  const [currentTrack, setCurrentTrack] = useState<Track | undefined>(
    undefined
  );
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);

  React.useEffect(() => {
    const setLikedStatus = async () => {
      setCurrentTrack(await TrackPlayer.getActiveTrack());
    };
    setLikedStatus();
  }, [currentPlayingId]);

  return currentTrack ? (
    <AlbumArt track={currentTrack} lyricStyle={panelStyle} />
  ) : (
    <></>
  );
};

export default LandscapeLyricView;
