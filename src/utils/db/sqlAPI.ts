import { eq } from 'drizzle-orm';

import db from './sql';
import playbackTable from './schema/playbackCount';

export const getPlaybackCountTable = async () =>
  db.select().from(playbackTable).all();

export const _getPlaybackCount = async (songcid: string) =>
  db
    .select({ field1: playbackTable.count })
    .from(playbackTable)
    .where(eq(playbackTable.songcid, songcid))
    .get();
