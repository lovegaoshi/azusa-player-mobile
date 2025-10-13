import React from 'react';
import { usePlaybackState } from 'react-native-track-player';

import FavoriteButton from './FavoriteButton';
import ReloadButton from './ReloadButton';

export default function FavReloadButton({ track }: NoxComponent.TrackProps) {
  const playback = usePlaybackState();

  return 'error' in playback ? (
    <ReloadButton track={track} />
  ) : (
    <FavoriteButton track={track} />
  );
}
