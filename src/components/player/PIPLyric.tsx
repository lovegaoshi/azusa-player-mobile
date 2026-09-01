import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import TrackPlayer, { Track } from 'react-native-track-player';

import { useNoxSetting } from '@stores/useApp';
import { LyricView } from './Lyric';
import usePlayerControls from '@components/player/controls/usePlayerControls';
import useLyric from '@hooks/useRNTPLyric';

const PIPLyricView = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | undefined>(
    undefined,
  );
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const { height } = useWindowDimensions();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = usePlayerControls();

  const usedLyric = useLyric({
    track: currentTrack,
    artist: currentTrack?.artist ?? '',
  });

  React.useEffect(() => {
    TrackPlayer.getActiveTrack().then(setCurrentTrack);
  }, [currentPlayingId]);

  return currentTrack ? (
    <LyricView
      usedLyric={usedLyric}
      track={currentTrack}
      artist={'n/a'}
      // HACK: for problems see https://github.com/facebook/react-native/issues/34324
      height={height / 2 + 10}
      showUI={false}
      noScrollThrottle={true}
      fadeEffect={false}
    />
  ) : (
    <></>
  );
};

export default PIPLyricView;
