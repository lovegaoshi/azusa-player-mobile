import { eq } from 'drizzle-orm';

import db from './sql';
import playbackTable from './schema/playbackCount';
import r128GainTable from './schema/r128gainTable';
import lyricTable from './schema/lyricTable';
import abrepeatTable from './schema/abrepeatTable';
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

export const getPlaybackCountsAPI = async () => {
  const res = db
    .select({
      id: playbackTable.songcid,
      count: playbackTable.count,
      lastPlayed: playbackTable.lastPlayed,
    })
    .from(playbackTable)
    .innerJoin(tempTable, eq(tempTable.songcid, playbackTable.songcid))
    .all();
  return res.reduce(
    (acc, curr) => {
      acc[curr.id] = {
        count: curr.count,
        lastPlayed: curr.lastPlayed,
      };
      return acc;
    },
    {} as { [id: string]: { count: number; lastPlayed: number | null } },
  );
};

export const getR128GainAPI = async (songcid: string) =>
  db
    .select({
      r128gain: r128GainTable.r128gain,
    })
    .from(r128GainTable)
    .where(eq(r128GainTable.songcid, songcid))
    .get();

export const getABRepeatAPI = async (songcid: string) =>
  db
    .select({
      a: abrepeatTable.a,
      b: abrepeatTable.b,
    })
    .from(abrepeatTable)
    .where(eq(abrepeatTable.songcid, songcid))
    .get();
