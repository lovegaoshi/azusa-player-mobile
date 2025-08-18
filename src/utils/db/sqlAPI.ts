import { eq, getTableColumns } from 'drizzle-orm';

import db from './sql';
import playbackTable from './schema/playbackCount';
import r128GainTable from './schema/r128gainTable';
import lyricTable from './schema/lyricTable';
import abrepeatTable from './schema/abrepeatTable';
import tempTable from './schema/tempSongTable';
import tempidTable from './schema/tempSongidTable';
import songTable from './schema/songTable';
import playlistTable from './schema/playlistTable';
import songBeatTable from './schema/songBeatTable';
import { dummyPlaylist } from '@objects/Playlist';

export const exportSQL = async () => {
  const res = {
    playbackCount: db.select().from(playbackTable).all(),
    lyric: db.select().from(lyricTable).all(),
    r128gain: db.select().from(r128GainTable).all(),
    abrepeat: db.select().from(abrepeatTable).all(),
  };
  return JSON.stringify(res);
};

export const getPlaybackCountAPI = async (songcid?: string) =>
  db
    .select({
      count: playbackTable.count,
      lastPlayed: playbackTable.lastPlayed,
    })
    .from(playbackTable)
    .where(eq(playbackTable.songcid, songcid ?? ''))
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

export const getR128Gain = async (songcid?: string) => {
  const res = db
    .select({
      r128gain: r128GainTable.r128gain,
    })
    .from(r128GainTable)
    .where(eq(r128GainTable.songcid, songcid ?? ''))
    .get();
  return res?.r128gain;
};

export const getABRepeatRaw = async (songcid?: string) => {
  return db
    .select({
      a: abrepeatTable.a,
      b: abrepeatTable.b,
      aAbs: abrepeatTable.aAbs,
      bAbs: abrepeatTable.bAbs,
    })
    .from(abrepeatTable)
    .where(eq(abrepeatTable.songcid, songcid ?? ''))
    .get();
};

/**
 * returns [a, b, aAbs, bAbs] where a-b is the 0-1 range; aAbs-bAbs is the absolute range
 */
export const getABRepeat = async (
  songcid?: string,
): Promise<[number, number, number?, number?]> => {
  const res = await getABRepeatRaw(songcid);
  return [
    res?.a ?? 0,
    res?.b ?? 1,
    res?.aAbs ?? undefined,
    res?.bAbs ?? undefined,
  ];
};

export const getLyric = async (
  songcid?: string,
): Promise<NoxMedia.LyricDetail | undefined> => {
  return db
    .select()
    .from(lyricTable)
    .where(eq(lyricTable.songId, songcid ?? ''))
    .get() as NoxMedia.LyricDetail;
};

export const getSyncABRepeatR128 = async () => {
  const abrepeat = db
    .select({
      id: abrepeatTable.songcid,
      a: abrepeatTable.a,
      b: abrepeatTable.b,
    })
    .from(abrepeatTable)
    .all();

  const r128gain = db
    .select({
      id: r128GainTable.songcid,
      r128gain: r128GainTable.r128gain,
    })
    .from(r128GainTable)
    .all();

  const res: {
    [id: string]: { itemid: string; abrepeat?: string; r128gain?: number };
  } = {};

  abrepeat.reduce(
    (acc, curr) => ({
      ...acc,
      [curr.id]: {
        ...acc[curr.id],
        itemid: curr.id,
        abrepeat: JSON.stringify([(curr.a ?? 0, curr.b ?? 1)]),
      },
    }),
    res,
  );
  r128gain.reduce(
    (acc, curr) => ({
      ...acc,
      [curr.id]: {
        ...acc[curr.id],
        itemid: curr.id,
        r128gain: curr.r128gain ?? undefined,
      },
    }),
    res,
  );

  return Object.values(res);
};

export const getSong = async (
  songcid?: string,
): Promise<NoxMedia.Song | undefined> => {
  const res = db
    .select()
    .from(songTable)
    .where(eq(songTable.id, songcid ?? ''))
    .get();
  // HACK: force converted some null here! check if an issue
  return res as NoxMedia.Song;
};

export const getPlaylist = async (
  id?: string,
): Promise<NoxMedia.Playlist | undefined> => {
  const res = db
    .select()
    .from(playlistTable)
    .where(eq(playlistTable.id, id ?? ''))
    .get();
  if (res === undefined) return;
  const songListIds = JSON.parse(res.songList) as number[];

  await db.delete(tempidTable);
  await db.insert(tempidTable).values(songListIds.map(v => ({ songid: v })));
  const songs = db
    .select({ ...getTableColumns(songTable) })
    .from(songTable)
    .innerJoin(tempidTable, eq(tempidTable.songid, songTable.internalid))
    .all();
  const settings = JSON.parse(res.settings);
  return {
    ...dummyPlaylist(),
    ...res,
    ...settings,
    settings: undefined,
    songList: songs,
  };
};

export const getSongBeat = (songcid: string): number[] | undefined => {
  const res = db
    .select({
      beat: songBeatTable.beat,
    })
    .from(songBeatTable)
    .where(eq(songBeatTable.songcid, songcid))
    .get()?.beat;
  return res === undefined ? res : (JSON.parse(res) as number[]);
};
