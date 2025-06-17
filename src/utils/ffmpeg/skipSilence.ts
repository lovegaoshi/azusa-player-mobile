import { getABRepeatRaw } from '../db/sqlAPI';
import { setABRepeat } from '../db/sqlStorage';
import logger from '../Logger';
import { probeLoudness } from './ffmpeg';

export const setNoxSkipSilence = async (path: string, song: NoxMedia.Song) => {
  logger.debug(`[SkipSilence] now starting FFMPEG skip silence for ${song.id}`);
  const abrepeat = await getABRepeatRaw(song.id);
  if (abrepeat?.a !== undefined || abrepeat?.b !== undefined) {
    logger.debug(`[SkipSilence] ABrepeat exists; skipping...`);
    return;
  }
  const newABRepeat = await probeLoudness(path);
  setABRepeat(song.id, { a: newABRepeat[0], b: newABRepeat[1] });
};
