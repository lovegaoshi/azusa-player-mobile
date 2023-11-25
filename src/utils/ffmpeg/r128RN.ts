import TrackPlayer from 'react-native-track-player';

import { getR128Gain } from './r128Store';

export const getR128GainAsync = async (song?: NoxMedia.Song) => {
  if (song === undefined) {
    song = (await TrackPlayer.getActiveTrack())?.song;
  }
  return getR128Gain(song);
};
