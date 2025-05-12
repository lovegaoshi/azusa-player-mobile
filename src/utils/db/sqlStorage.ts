import { eq } from 'drizzle-orm';

import playbackTable from '@utils/db/schema/playbackCount';
import r128gainTable from '@utils/db/schema/r128gainTable';
import lyricTable from '@utils/db/schema/lyricTable';
import abRepeatTable from '@utils/db/schema/abrepeatTable';
import tempTable from '@utils/db/schema/tempSongTable';
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
  songcid: string;
  lyric: string | null;
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

export const restorePlaybackCount = async (data: PlaybackCount[]) => {
  if (!data) return;
  try {
    await db.delete(playbackTable);
    await db.insert(playbackTable).values(data);
  } catch (e) {
    logger.error(`[APMSQL] failed to import playback count! ${e}`);
  }
};

export const restoreABRepeat = async (data: ABRepeat[]) => {
  if (!data) return;
  try {
    await db.delete(abRepeatTable);
    await db.insert(abRepeatTable).values(data);
  } catch (e) {
    logger.error(`[APMSQL] failed to import abRepeatTable! ${e}`);
  }
};

export const restoreLyric = async (data: Lyric[]) => {
  if (!data) return;
  try {
    await db.delete(lyricTable);
    await db.insert(lyricTable).values(data);
  } catch (e) {
    logger.error(`[APMSQL] failed to import lyric! ${e}`);
  }
};

export const restoreR128Gain = async (data: R128Gain[]) => {
  if (!data) return;
  try {
    await db.delete(r128gainTable);
    await db.insert(r128gainTable).values(data);
  } catch (e) {
    logger.error(`[APMSQL] failed to import r128gain! ${e}`);
  }
};

export const importSQL = async (json: string) => {
  try {
    const data = JSON.parse(json);
    await restorePlaybackCount(data.playbackCount);
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

export const setR128Gain = async (songcid: string, r128gain?: number) => {
  db.insert(r128gainTable).values({ songcid, r128gain }).onConflictDoUpdate({
    target: r128gainTable.songcid,
    set: { r128gain },
  });
};
