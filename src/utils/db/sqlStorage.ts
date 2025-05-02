import { eq } from 'drizzle-orm';

import playbackTable from '@utils/db/schema/playbackCount';
import db from '@utils/db/sql';
import { _getPlaybackCount, getPlaybackCountTable } from '@utils/db/sqlAPI';

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
  const res = await _getPlaybackCount(songcid);
  return res?.field1;
};

export const increasePlaybackCount = async (
  songcid: string | null,
  inc = 1,
) => {
  if (!songcid) {
    return;
  }
  const count = await getPlaybackCount(songcid);
  if (count === undefined) {
    await db.insert(playbackTable).values({ songcid, count: inc });
    return;
  }
  await db
    .update(playbackTable)
    .set({ count: count + inc })
    .where(eq(playbackTable.songcid, songcid));
};
