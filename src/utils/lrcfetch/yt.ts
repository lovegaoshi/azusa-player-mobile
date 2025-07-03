import { LrcSource } from '@enums/LyricFetch';
import logger from '../Logger';
import { ms2MMSS } from '@utils/Utils';
import { Source } from '@enums/MediaFetch';
import { ytwebClient } from '@utils/mediafetch/ytbi';

const getLrcOptions = async (
  song?: NoxMedia.Song,
): Promise<NoxLyric.NoxFetchedLyric[]> => {
  try {
    if (song?.source !== Source.ytbvideo) return [];
    const ytc = await ytwebClient();
    const info = await ytc.getInfo(song.bvid);
    const a = await info.getTranscript();
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
  const ytc = await ytwebClient();
  const info = await ytc.getInfo(songMid);
  const transcript = await info.getTranscript();
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
