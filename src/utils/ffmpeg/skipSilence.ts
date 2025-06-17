import { getABRepeatRaw } from '../db/sqlAPI';
import { setABRepeat } from '../db/sqlStorage';
import { probeLoudness } from './ffmpeg';

export const setNoxSkipSilence = async (path: string, song: NoxMedia.Song) => {
  const abrepeat = await getABRepeatRaw(song.id);
  if (abrepeat?.a !== undefined || abrepeat?.b !== undefined) {
    return;
  }
  const newABRepeat = await probeLoudness(path);
  setABRepeat(song.id, { a: newABRepeat[0], b: newABRepeat[1] });
};
