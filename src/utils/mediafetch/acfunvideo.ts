import * as cheerio from 'cheerio';

import SongTS from '@objects/Song';
import { biliApiLimiter } from './throttle';
import bfetch from '@utils/BiliFetch';
import { Source } from '@enums/MediaFetch';

const resolveACFun = async (acid: string) => {
  const req = await bfetch(`https://www.acfun.cn/v/${acid}`);
  const parser = cheerio.load(await req.text());
  // HACK: i cant figure out regex. this will work...
  const script = parser('script');
  const extractedScript = script
    .get()
    .map(v =>
      // @ts-expect-error
      v.children[0]?.data?.includes?.('window.videoInfo')
        ? // @ts-expect-error
          v.children[0].data
        : null
    )
    .filter(x => !!x)[0] as string;
  if (extractedScript === undefined) {
    throw new Error('Failed to extract script');
  }
  let jsonScript = extractedScript.substring(
    extractedScript.indexOf('{'),
    extractedScript.lastIndexOf('window.videoResource')
  );
  jsonScript = jsonScript.substring(0, jsonScript.lastIndexOf(';'));
  return JSON.parse(jsonScript);
};

export const resolveURL = async (v: NoxMedia.Song) => {
  const json = await resolveACFun(v.bvid);
  const kson = JSON.parse(json.currentVideoInfo.ksPlayJson);
  const adaptFormats = kson.adaptationSet[0].representation.sort(
    (a: any, b: any) => a.avgBitrate - b.avgBitrate
  );
  return { url: adaptFormats[0].url };
};

export const fetchAudioInfo = (acid: string, progressEmitter?: () => void) =>
  biliApiLimiter.schedule(async () => {
    progressEmitter?.();
    const videoInfo = await resolveACFun(acid);
    return [
      SongTS({
        cid: `${Source.acfun}-${acid}`,
        bvid: acid,
        name: videoInfo.title,
        nameRaw: videoInfo.title,
        singer: videoInfo.user.name,
        singerId: videoInfo.channel_id!,
        cover: videoInfo.coverUrl,
        lyric: '',
        page: 1,
        duration: videoInfo.durationMillis / 1000,
        album: videoInfo.title,
        source: Source.acfun,
      }),
    ];
  });

const regexFetch = async ({
  reExtracted,
}: NoxNetwork.RegexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => {
  const audioInfo = await fetchAudioInfo(reExtracted[1]);
  return { songList: audioInfo ?? [] };
};

const refreshSong = (song: NoxMedia.Song) => song;

const export2URL = (song: NoxMedia.Song) =>
  `https://www.youtube.com/watch?v=${song.bvid}`;

export default {
  regexSearchMatch: /acfun\.cn\/v\/(ac[0-9]+)/,
  regexFetch,
  regexResolveURLMatch: /^acfun-/,
  resolveURL,
  refreshSong,
  export2URL,
};
