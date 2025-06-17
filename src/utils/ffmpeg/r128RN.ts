import TrackPlayer from 'react-native-track-player';

import { setR128Gain as setR128GainSQL } from '@utils/db/sqlStorage';
import { getR128Gain } from '@utils/db/sqlAPI';
import logger from '../Logger';
import { r128gain, setR128Gain } from './ffmpeg';

export const getR128GainAsync = async (song?: NoxMedia.Song) => {
  if (song === undefined) {
    song = (await TrackPlayer.getActiveTrack())?.song;
  }
  if (!song) return 0;
  return (await getR128Gain(song.id)) ?? 0;
};

export const setNoxR128Gain = async (path: string, song: NoxMedia.Song) => {
  const previousGain = await getR128Gain(song.id);
  logger.debug(
    `[FFMPEG] now starting FFMPEG r128gain. prev: (${previousGain})`,
  );
  if (previousGain === null || previousGain === undefined) {
    const gain = await r128gain(path);
    await setR128GainSQL(song.id, gain);
    setR128Gain(gain, song);
  } else {
    setR128Gain(previousGain, song);
  }
};
