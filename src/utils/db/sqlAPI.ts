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

export const getABRepeat = async (
  songcid?: string,
): Promise<[number, number]> => {
  const res = db
    .select({
      a: abrepeatTable.a,
      b: abrepeatTable.b,
    })
    .from(abrepeatTable)
    .where(eq(abrepeatTable.songcid, songcid ?? ''))
    .get();
  return [res?.a ?? 0, res?.b ?? 1];
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

/**
 * unsure how useful this is - gets a song by its cid.
 * @param songcid
 * @returns
 */
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

/**
 *
 * @param id
 * @returns
 */
export const getPlaylist = async ({
  key = '',
  defaultPlaylist = dummyPlaylist,
}): Promise<NoxMedia.Playlist> => {
  const res = db
    .select()
    .from(playlistTable)
    .where(eq(playlistTable.id, key))
    .get();
  if (res === undefined) return defaultPlaylist();

  const songListIds = JSON.parse(res.songList) as number[];
  let songs: NoxMedia.Song[] = [];
  // innerjoin will fail if tempidTable is empty
  if (songListIds.length > 0) {
    await db.delete(tempidTable);
    await db
      .insert(tempidTable)
      .values(songListIds.map(v => ({ songid: v })))
      .onConflictDoNothing();
    songs = db
      .select({ ...getTableColumns(songTable) })
      .from(songTable)
      .innerJoin(tempidTable, eq(tempidTable.songid, songTable.internalid))
      .all() as NoxMedia.Song[];
  }
  const settings = JSON.parse(res.settings);
  return {
    ...defaultPlaylist(),
    ...res,
    ...settings,
    settings: undefined,
    songList: songs,
  };
};

/**
 * used in migrating/importing playlists
 * @param v
 * @returns
 */
export const getSongSQLID = async (v: NoxMedia.Song) => {
  const res = db
    .select({ id: songTable.internalid })
    .from(songTable)
    .where(eq(songTable.id, v.id))
    .get();
  if (res !== undefined) return res.id;
  // insert it
  const parsedSong = {
    ...v,
    singerId: String(v.singerId),
  };
  const insert = await db
    .insert(songTable)
    .values(parsedSong)
    .returning({ id: songTable.internalid });
  return insert[0].id;
};

export const getPlaylistIds = async () => {
  const res = db.select({ id: playlistTable.id }).from(playlistTable).all();
  return res.map(v => v.id);
};
