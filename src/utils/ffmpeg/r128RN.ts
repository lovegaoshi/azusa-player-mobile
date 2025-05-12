import TrackPlayer from 'react-native-track-player';

import { getR128Gain } from '@utils/db/sqlAPI';

export const getR128GainAsync = async (song?: NoxMedia.Song) => {
  if (song === undefined) {
    song = (await TrackPlayer.getActiveTrack())?.song;
  }
  if (!song) return 0;
  return (await getR128Gain(song.id)) ?? 0;
};
