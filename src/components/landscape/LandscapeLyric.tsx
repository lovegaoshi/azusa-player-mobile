import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import TrackPlayer, { Track } from 'react-native-track-player';

import { useNoxSetting } from '@hooks/useSetting';
import { LyricView } from '../player/Lyric';

const LandscapeLyricView = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | undefined>(
    undefined
  );
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const { height } = useWindowDimensions();

  React.useEffect(() => {
    const setLikedStatus = async () => {
      setCurrentTrack(await TrackPlayer.getActiveTrack());
    };
    setLikedStatus();
  }, [currentPlayingId]);

  return currentTrack ? (
    <LyricView
      track={currentTrack}
      artist={'n/a'}
      // HACK: for problems see https://github.com/facebook/react-native/issues/34324
      height={height - 10}
      noScrollThrottle={true}
    />
  ) : (
    <></>
  );
};

export default LandscapeLyricView;
