/**
 * this is the common SQL interface meant to be shared between mobile (sqlite) and web (pglite).
 * any incompatibilities should be handled in sqlAPI
 */
import { eq } from 'drizzle-orm';

import playbackTable from '@utils/db/schema/playbackCount';
import r128gainTable from '@utils/db/schema/r128gainTable';
import lyricTable from '@utils/db/schema/lyricTable';
import abRepeatTable from '@utils/db/schema/abrepeatTable';
import tempTable from '@utils/db/schema/tempSongTable';
import songTable from '@utils/db/schema/songTable';
import playlistTable from '@utils/db/schema/playlistTable';
import db from '@utils/db/sql';
import { getPlaybackCountAPI, getPlaybackCountsAPI } from '@utils/db/sqlAPI';
import { logger } from '@utils/Logger';
import type {
  ABRepeat,
  Lyric,
  PlaybackCount,
  R128Gain,
  Song,
  Playlist,
} from './type';

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

export const restorePlaybackCount = async (
  data: PlaybackCount[],
  reset = false,
) => {
  if (!data) return;
  try {
    reset && (await db.delete(playbackTable));
    await db.insert(playbackTable).values(data).onConflictDoNothing();
  } catch (e) {
    logger.error(`[APMSQL] failed to import playback count! ${e}`);
  }
};

export const restoreABRepeat = async (data: ABRepeat[], reset = false) => {
  if (!data) return;
  try {
    reset && (await db.delete(abRepeatTable));
    await db.insert(abRepeatTable).values(data).onConflictDoNothing();
  } catch (e) {
    logger.error(`[APMSQL] failed to import abRepeatTable! ${e}`);
  }
};

export const restoreLyric = async (data: Lyric[], reset = false) => {
  if (!data) return;
  try {
    reset && (await db.delete(lyricTable));
    await db.insert(lyricTable).values(data).onConflictDoNothing();
  } catch (e) {
    logger.error(`[APMSQL] failed to import lyric! ${e}`);
  }
};

export const restoreR128Gain = async (data: R128Gain[], reset = false) => {
  if (!data) return;
  try {
    reset && (await db.delete(r128gainTable));
    await db.insert(r128gainTable).values(data).onConflictDoNothing();
  } catch (e) {
    logger.error(`[APMSQL] failed to import r128gain! ${e}`);
  }
};

export const restoreSongs = async (data: Song[], reset = true) => {
  if (!data) return;
  try {
    reset && (await db.delete(songTable));
    await db.insert(songTable).values(data).onConflictDoNothing();
  } catch (e) {
    logger.error(`[APMSQL] failed to import songTable!! CRITICAL ${e}`);
  }
};

export const restorePlaylist = async (data: Playlist[], reset = false) => {
  if (!data) return;
  try {
    reset && (await db.delete(playlistTable));
    await db.insert(playlistTable).values(data).onConflictDoNothing();
  } catch (e) {
    logger.error(`[APMSQL] failed to import playlist table! ${e}`);
  }
};

export const importSQL = async (json: string) => {
  try {
    const data = JSON.parse(json);
    await restorePlaybackCount(data.playbackCount);
    await restoreLyric(data.lyric);
    await restoreR128Gain(data.r128gain);
    await restoreABRepeat(data.abrepeat);
  } catch (e) {
    logger.error(e);
    logger.error('[APMSQL] Import SQL failed');
  }
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

export const setR128Gain = async (
  songcid: string,
  r128gain?: number | null,
) => {
  await db
    .insert(r128gainTable)
    .values({ songcid, r128gain })
    .onConflictDoUpdate({
      target: r128gainTable.songcid,
      set: { r128gain },
    });
};

export const setABRepeat = async (
  songcid: string,
  ab: { a: number | null | undefined; b: number | null | undefined },
) => {
  await db
    .insert(abRepeatTable)
    .values({ songcid, ...ab })
    .onConflictDoUpdate({
      target: abRepeatTable.songcid,
      set: ab,
    });
};

export const setLyricMapping = async (v: Partial<NoxMedia.LyricDetail>) => {
  await db
    .insert(lyricTable)
    .values({
      songId: '',
      lyricKey: '',
      lyricOffset: 0,
      lyric: '',
      ...v,
    })
    .onConflictDoUpdate({
      target: lyricTable.songId,
      set: v,
    });
};
