import { eq } from 'drizzle-orm';

import db from './sql';
import playbackTable from './schema/playbackCount';
import tempTable from './schema/tempSongTable';

export const getPlaybackCountTable = async () =>
  db.select().from(playbackTable).all();

export const getPlaybackCountAPI = async (songcid: string) =>
  db
    .select({
      count: playbackTable.count,
      lastPlayed: playbackTable.lastPlayed,
    })
    .from(playbackTable)
    .where(eq(playbackTable.songcid, songcid))
    .get();

export const getPlaybackCountsAPI = async () =>
  db
    .select({
      count: playbackTable.count,
      lastPlayed: playbackTable.lastPlayed,
    })
    .from(playbackTable)
    .innerJoin(tempTable, eq(tempTable.songcid, playbackTable.songcid))
    .get();
