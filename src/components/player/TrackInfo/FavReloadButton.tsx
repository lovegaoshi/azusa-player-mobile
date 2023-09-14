import React from 'react';
import { Track, usePlaybackState } from 'react-native-track-player';

import FavoriteButton from './FavoriteButton';
import ReloadButton from './ReloadButton';

interface Props {
  track?: Track;
}

export default ({ track }: Props) => {
  const playback = usePlaybackState();

  return 'error' in playback ? (
    <ReloadButton track={track} />
  ) : (
    <FavoriteButton track={track} />
  );
};
