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
import songBeatTable from '@utils/db/schema/songBeatTable';
import songDLTable from '@utils/db/schema/songDLTable';
import db from '@utils/db/sql';
import { getPlaybackCountAPI, getPlaybackCountsAPI } from '@utils/db/sqlAPI';
import { logger } from '@utils/Logger';

interface PlaybackCount {
  songcid: string;
  count: number;
  lastPlayed: number | null;
}

interface R128Gain {
  songcid: string;
  r128gain: number | null;
}

interface ABRepeat {
  songcid: string;
  a: number | null;
  b: number | null;
}

interface Lyric {
  songId: string;
  lyric: string;
  lyricKey: string;
  lyricOffset: number;
  source?: string | null;
}

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

export const importSQL = async (data: any) => {
  try {
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
  const currentTime = Number(Date.now());
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
  ab: {
    a: number | null | undefined;
    b: number | null | undefined;
    aAbs?: number | null;
    bAbs?: number | null;
  },
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

export const setSongBeat = async (songcid: string, beatArray: number[]) => {
  const beat = JSON.stringify(beatArray);
  await db.insert(songBeatTable).values({ songcid, beat }).onConflictDoUpdate({
    target: songBeatTable.songcid,
    set: { beat },
  });
};

export const setSongDownloadPath = async (
  songcid: string,
  downloadPath: string,
) => {
  await db
    .insert(songDLTable)
    .values({ songcid, downloadPath })
    .onConflictDoUpdate({
      target: songDLTable.songcid,
      set: { downloadPath },
    });
};
