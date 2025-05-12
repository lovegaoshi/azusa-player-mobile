import { eq } from 'drizzle-orm';

import playbackTable from '@utils/db/schema/playbackCount';
import tempTable from '@utils/db/schema/tempSongTable';
import db from '@utils/db/sql';
import {
  getPlaybackCountAPI,
  getPlaybackCountsAPI,
  getPlaybackCountTable,
} from '@utils/db/sqlAPI';
import { logger } from '@utils/Logger';

const loadPlaylistToTemp = async (songcids: NoxMedia.Song[]) => {
  await db.delete(tempTable);
  await db.insert(tempTable).values(songcids.map(v => ({ songcid: v.id })));
};

export const getPlaylistPlaybackCount = async (playlist: NoxMedia.Playlist) => {
  try {
    await loadPlaylistToTemp(playlist.songList);
    return await getPlaybackCountsAPI();
  } catch {
    return {};
  }
};

export const exportSQL = async () => {
  const data = {
    playbackCount: await getPlaybackCountTable(),
  };
  return JSON.stringify(data);
};

export const importSQL = async (json: string) => {
  try {
    const data = JSON.parse(json);
    if (data.playbackCount) {
      await clearPlaybackCount();
      db.insert(playbackTable).values(data.playbackCount);
    }
  } catch (e) {
    logger.error(e);
    logger.error('[APMSQL] Import SQL failed');
  }
};

export const clearPlaybackCount = async () => {
  await db.delete(playbackTable);
};

export const getPlaybackCounts = async () => {
  const res = await getPlaybackCountTable();
  const result: { [id: string]: number } = {};
  res.forEach(v => {
    result[v.songcid] = v.count;
  });
  return result;
};

export const getPlaybackCount = async (songcid: string | null) => {
  if (!songcid) {
    return 0;
  }
  const res = await getPlaybackCountAPI(songcid);
  return res?.count;
};

export const getPlaybackDate = async (songcid: string | null) => {
  if (!songcid) {
    return 0;
  }
  const res = await getPlaybackCountAPI(songcid);
  return res?.lastPlayed;
};

export const increasePlaybackCount = async (
  songcid: string | null,
  inc = 1,
) => {
  if (!songcid) {
    return;
  }
  const count = await getPlaybackCount(songcid);
  const currentTime = Date.now();
  if (count === undefined) {
    await db
      .insert(playbackTable)
      .values({ songcid, count: inc, lastPlayed: currentTime });
    return;
  }
  await db
    .update(playbackTable)
    .set({ count: count + inc, lastPlayed: currentTime })
    .where(eq(playbackTable.songcid, songcid));
};
