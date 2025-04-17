import { eq } from 'drizzle-orm';

import playbackTable from './schema/playbackCount';
import db from './sql';

export const clearPlaybackCount = async () => {
  await db.delete(playbackTable);
};

export const getPlaybackCounts = async () => {
  const res = db.select().from(playbackTable).all();
  const result: { [id: string]: number } = {};
  res.forEach(v => {
    result[v.songcid] = v.count;
  });
  return result;
};

export const getPlaybackCount = (songcid: string | null) => {
  if (!songcid) {
    return 0;
  }
  const res = db
    .select({ field1: playbackTable.count })
    .from(playbackTable)
    .where(eq(playbackTable.songcid, songcid))
    .get();
  return res?.field1;
};

export const increasePlaybackCount = async (songcid: string | null) => {
  if (!songcid) {
    return;
  }
  const count = await getPlaybackCount(songcid);
  if (count === undefined) {
    await db.insert(playbackTable).values({ songcid, count: 1 });
    return;
  }
  await db
    .update(playbackTable)
    .set({ count: count + 1 })
    .where(eq(playbackTable.songcid, songcid));
};
