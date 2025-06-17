import { getABRepeatRaw } from '../db/sqlAPI';
import { setABRepeat as setABRepeatSQL } from '../db/sqlStorage';
import logger from '../Logger';
import { probeLoudness } from './ffmpeg';
import { useNoxSetting } from '@stores/useApp';

export const setNoxSkipSilence = async (path: string, song: NoxMedia.Song) => {
  logger.debug(`[SkipSilence] now starting FFMPEG skip silence for ${song.id}`);
  const abrepeat = await getABRepeatRaw(song.id);
  if (abrepeat?.a !== undefined || abrepeat?.b !== undefined) {
    logger.debug(`[SkipSilence] ABrepeat exists; skipping...`);
    return;
  }
  const newABRepeat = await probeLoudness(path);
  logger.debug(`[SkipSilence] analyzed: ${newABRepeat[0]}, ${newABRepeat[1]}`);
  setABRepeatSQL(song.id, { a: newABRepeat[0], b: newABRepeat[1] });
  const { setCurrentABRepeat, currentPlayingId, setABRepeat } =
    useNoxSetting.getState();
  if (currentPlayingId === song.id) {
    setCurrentABRepeat(newABRepeat);
    setABRepeat(newABRepeat);
  }
};
