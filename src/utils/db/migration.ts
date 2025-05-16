import {
  getR128GainMapping,
  saveR128GainMapping,
  getABMapping,
  saveABMapping,
  getLyricMapping,
  saveLyricMapping,
} from '@utils/ChromeStorage';
import { restoreR128Gain, restoreABRepeat, restoreLyric } from './sqlStorage';
import logger from '../Logger';

const migrateR128GainToSQL = async () => {
  try {
    const data = await getR128GainMapping();
    if ((Object.entries(data).length ?? 0) > 0) {
      logger.debug(`[APMSQL] migrating r128gain. `);
      await saveR128GainMapping({});
      await restoreR128Gain(
        Object.entries(data).map(([k, v]) => ({ songcid: k, r128gain: v })),
      );
    }
  } catch (e) {
    logger.error(`[APMSQL] failed to migrate r128gain. ${e}`);
  }
};

const migrateABRepeatToSQL = async () => {
  try {
    const data = await getABMapping();
    if ((Object.entries(data).length ?? 0) > 0) {
      logger.debug(`[APMSQL] migrating abrepeat. `);
      await saveABMapping({});
      await restoreABRepeat(
        Object.entries(data).map(([k, v]) => ({
          songcid: k,
          a: v[0] ?? 0,
          b: v[1] ?? 1,
        })),
      );
    }
  } catch (e) {
    logger.error(`[APMSQL] failed to migrate r128gain. ${e}`);
  }
};

const migrateLyricToSQL = async () => {
  try {
    const arr = Array.from(
      (await getLyricMapping()).values(),
    ) as NoxMedia.LyricDetail[];
    if ((arr.length ?? 0) > 0) {
      logger.debug(`[APMSQL] migrating lyric mapping. `);
      await restoreLyric(arr);
    }
    await saveLyricMapping(new Map());
  } catch (e) {
    logger.error(`[APMSQL] failed to migrate r128gain. ${e}`);
  }
};
export default async () => {
  await migrateR128GainToSQL();
  await migrateABRepeatToSQL();
  await migrateLyricToSQL();
};
