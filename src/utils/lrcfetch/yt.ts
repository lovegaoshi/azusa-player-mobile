import { ClientType } from 'youtubei.js';

import { LrcSource } from '@enums/LyricFetch';
import logger from '../Logger';
import { ms2MMSS } from '@utils/Utils';
import { Source } from '@enums/MediaFetch';
import { ytwebClient } from '@utils/mediafetch/ytbi';
import bfetch from '@utils/BiliFetch';

const getLrc = async (mid: string) => {
    const ytc = await ytwebClient();
    const info = await ytc.getBasicInfo(mid, {client: ClientType.ANDROID});
    if (info.captions?.caption_tracks?.[0] === undefined) throw new Error('no captions'); 
    const res = await bfetch(info.captions.caption_tracks[0].base_url),
        text = await res.text();
    console.log(text);
    return await info.getTranscript();
}

const getLrcOptions = async (
  song?: NoxMedia.Song,
): Promise<NoxLyric.NoxFetchedLyric[]> => {
  try {
    if (song?.source !== Source.ytbvideo) return [];
    await getLrc(song.bvid);
    return [
      {
        key: song.bvid,
        songMid: song.bvid,
        source: LrcSource.YT,
        label: `[YT] Closed captions`,
      },
    ];
  } catch {
    logger.warn(`[YT] transcirpt fetch failed (could be it DNE tho)`);
  }
  return [];
};

const getLyric = async (songMid: string) => {
  logger.debug(`[Lrc] calling YT gettranscript : ${songMid}`);
  const transcript = await getLrc(songMid);
  return (
    transcript.transcript.content?.body?.initial_segments?.reduce(
      (arr, curr) => {
        if (curr?.snippet?.text === undefined) return arr;
        const parsedText = curr.snippet.text?.replaceAll('\n', '.');
        return `${arr}[${ms2MMSS(Number(curr.start_ms))}]${parsedText}\n`;
      },
      '',
    ) ?? ''
  );
};

export default {
  getLrcOptions,
  getLyric,
};
