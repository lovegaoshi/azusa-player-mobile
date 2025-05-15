import {
  getR128GainMapping,
  saveR128GainMapping,
  getABMapping,
  saveABMapping,
  getLyricMapping,
  saveLyricMapping,
  getPlaylist,
} from '@utils/ChromeStorage';
import { saveItem, getItem, delPlaylist } from '@utils/ChromeStorageAPI';
import {
  restoreR128Gain,
  restoreABRepeat,
  restoreLyric,
  migratePlaylistToSQL,
} from './sqlStorage';
import logger from '../Logger';
import { StorageKeys } from '@enums/Storage';

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

const migratePlaylist = async (forced = false) => {
  const migrated = await getItem(StorageKeys.EXPO_SQL_MIGRATION, false);
  if (!forced && migrated) {
    return;
  }
  const playlists = await getItem(StorageKeys.MY_FAV_LIST_KEY, []);
  logger.debug(`[APMSQL] migrating playlist. `);
  await Promise.all(
    playlists.map(async (key: string) => {
      try {
        const playlist = await getPlaylist({
          key,
          throwOnNull: true,
        });
        return migratePlaylistToSQL(playlist);
      } catch {
        logger.warn(`[APMSQL] failed to migrate playlist ${key} (DNE).`);
      }
    }),
  );
  await Promise.all(playlists.map(delPlaylist));

  /**
  TODO: migrate favPlaylist, but how
  const favPlaylist = await getPlaylist({
    key: StorageKeys.FAVORITE_PLAYLIST_KEY,
  });
  await migratePlaylistToSQL(favPlaylist);
  await delPlaylist(StorageKeys.FAVORITE_PLAYLIST_KEY);
   */
  await saveItem(StorageKeys.EXPO_SQL_MIGRATION, 'true');
};

interface Migration {
  r128gain?: boolean;
  abrepeat?: boolean;
  lyric?: boolean;
  playlist?: boolean;
}

export default async ({ playlist = true }: Migration) => {
  await migrateR128GainToSQL();
  await migrateABRepeatToSQL();
  await migrateLyricToSQL();
  await migratePlaylist(playlist);
};
