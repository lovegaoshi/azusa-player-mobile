import { logger } from './Logger';

import { SearchOptions } from '@enums/Storage';
import steriatkFetch from './mediafetch/steriatk';
import biliVideoSimilarFetch from './mediafetch/biliVideoSimilar';
import biliBangumiFetch from './mediafetch/biliBangumi';
import biliAudioAMFetch from './mediafetch/biliAudioAM';
import biliAudioColleFetch from './mediafetch/biliAudioColle';
import biliAudioSimilarFetch from './mediafetch/biliAudioSimilar';
import bilivideoFetch from './mediafetch/bilivideo';
import biliavideoFetch from './mediafetch/biliavideo';
import biliseriesFetch from './mediafetch/biliseries';
import bilicolleFetch from './mediafetch/bilicolle';
import bilifavlistFetch from './mediafetch/bilifavlist';
import bilichannelFetch from './mediafetch/bilichannel';
import biliaudioFetch from './mediafetch/biliaudio';
import bilisearchFetch from '@utils/mediafetch/bilisearch';
import bilichannelAudioFetch from './mediafetch/bilichannelAudio';
import ytbvideoFetch from '@utils/mediafetch/ytbvideo';
import ytbplaylistFetch from './mediafetch/ytbplaylist';
import ytbmixlistFetch from './mediafetch/ytbmixlist';
import ytbsearchFetch from './mediafetch/ytbsearch';
import bililiveFetch from './mediafetch/bililive';
import bilisubliveFetch from './mediafetch/bilisublive';
import localFetch from '@utils/mediafetch/local';
import b23tvFetch from './mediafetch/b23tv';
import headRequestFetch from './mediafetch/headRequest';
import biliFavColleFetch from './mediafetch/biliFavColle';
import { MUSICFREE, searcher } from './mediafetch/musicfree';
import { getMusicFreePlugin } from '@utils/ChromeStorage';

/**
 * assign the proper extractor based on the provided url. uses regex.
 * @returns
 */
interface Props {
  input: string;
  progressEmitter?: (progress: number) => void;
  favList?: string[];
  useBiliTag?: boolean;
  fastSearch?: boolean;
  cookiedSearch?: boolean;
  defaultSearch?: SearchOptions | MUSICFREE;
}

export const matchBiliURL = <T>(
  input: string,
  extractions: ReExtraction<T>[]
) => {
  for (const reExtraction of extractions) {
    const reExtracted = reExtraction.match.exec(input);
    if (reExtracted == null) continue;
    return {
      regexFetch: reExtraction.fetch,
      reExtracted,
      refresh: reExtraction.refresh,
    };
  }
  return null;
};

export const searchBiliURLs = async ({
  input,
  progressEmitter = () => undefined,
  favList = [],
  useBiliTag = false,
  fastSearch = true,
  cookiedSearch = false,
  defaultSearch = SearchOptions.BILIBILI,
}: Props) => {
  let results: NoxMedia.SearchPlaylist = {
    songList: [],
  };
  try {
    progressEmitter(100);
    const matchShortURL = matchBiliURL(input, reExtractionsShortURL);
    if (matchShortURL !== null) {
      input = await matchShortURL.regexFetch({
        reExtracted: matchShortURL.reExtracted,
      });
    }
    const matchRegex = matchBiliURL(input, reExtractions);
    if (matchRegex !== null) {
      results = await matchRegex.regexFetch({
        reExtracted: matchRegex.reExtracted,
        progressEmitter,
        favList,
        useBiliTag,
      });
      results.refresh = matchRegex.refresh;
      progressEmitter(0);
      return results;
    }
    const headRequestResult = await headRequestFetch.regexFetch(input);
    if (headRequestResult) {
      results.songList = [headRequestResult];
    } else {
      // bilisearchFetch
      switch (defaultSearch) {
        case SearchOptions.YOUTUBE:
          results = await ytbsearchFetch.regexFetch({
            url: input,
            progressEmitter,
            fastSearch,
            cookiedSearch,
          });
          break;
        case MUSICFREE.aggregated:
          results.songList = await searcher[MUSICFREE.aggregated](
            input,
            await getMusicFreePlugin()
          );
          break;
        default:
          results = await bilisearchFetch.regexFetch({
            url: input,
            progressEmitter,
            fastSearch,
            cookiedSearch,
          });
      }
    }
  } catch (err) {
    logger.warn(err);
  }
  progressEmitter(0);
  return results;
};

interface ReExtraction<T> {
  match: RegExp;
  fetch: (v: NoxNetwork.RegexFetchProps) => Promise<T>;
  refresh?: (v: NoxMedia.Playlist) => Promise<NoxMedia.SearchPlaylist>;
}

const reExtractionsShortURL: ReExtraction<string>[] = [
  {
    match: b23tvFetch.regexSearchMatch,
    fetch: b23tvFetch.regexFetch,
  },
];

const reExtractions: ReExtraction<NoxNetwork.NoxRegexFetch>[] = [
  {
    match: biliFavColleFetch.regexSearchMatch,
    fetch: biliFavColleFetch.regexFetch,
  },
  {
    match: biliVideoSimilarFetch.regexSearchMatch,
    fetch: biliVideoSimilarFetch.regexFetch,
  },
  {
    match: localFetch.regexSearchMatch,
    fetch: localFetch.regexFetch,
  },
  {
    match: biliBangumiFetch.regexSearchMatch,
    fetch: biliBangumiFetch.regexFetch,
  },
  {
    match: biliAudioAMFetch.regexSearchMatch,
    fetch: biliAudioAMFetch.regexFetch,
  },
  {
    match: biliAudioSimilarFetch.regexSearchMatch,
    fetch: biliAudioSimilarFetch.regexFetch,
  },
  {
    match: biliAudioColleFetch.regexSearchMatch,
    fetch: biliAudioColleFetch.regexFetch,
  },
  {
    match: biliseriesFetch.regexSearchMatch,
    fetch: biliseriesFetch.regexFetch,
  },
  { match: bilicolleFetch.regexSearchMatch, fetch: bilicolleFetch.regexFetch },
  {
    match: bilichannelFetch.regexSearchMatch,
    fetch: bilichannelFetch.regexFetch,
  },
  {
    match: bilichannelAudioFetch.regexSearchMatch,
    fetch: bilichannelAudioFetch.regexFetch,
  },
  { match: biliaudioFetch.regexSearchMatch, fetch: biliaudioFetch.regexFetch },
  {
    match: bilifavlistFetch.regexSearchMatch,
    fetch: bilifavlistFetch.regexFetch,
  },
  {
    match: bilifavlistFetch.regexSearchMatch2,
    fetch: bilifavlistFetch.regexFetch,
  },
  { match: steriatkFetch.regexSearchMatch, fetch: steriatkFetch.regexFetch },
  { match: steriatkFetch.regexSearchMatch2, fetch: steriatkFetch.regexFetch },
  {
    match: ytbmixlistFetch.regexSearchMatch,
    fetch: ytbmixlistFetch.regexFetch,
    refresh: ytbmixlistFetch.refresh,
  },
  {
    match: ytbmixlistFetch.regexSearchMatch2,
    fetch: ytbmixlistFetch.regexFetch,
    refresh: ytbmixlistFetch.refresh,
  },
  {
    match: ytbplaylistFetch.regexSearchMatch,
    fetch: ytbplaylistFetch.regexFetch,
  },
  { match: ytbvideoFetch.regexSearchMatch, fetch: ytbvideoFetch.regexFetch },
  { match: bilivideoFetch.regexSearchMatch, fetch: bilivideoFetch.regexFetch },
  {
    match: biliavideoFetch.regexSearchMatch,
    fetch: biliavideoFetch.regexFetch,
  },
  { match: bililiveFetch.regexSearchMatch, fetch: bililiveFetch.regexFetch },
  {
    match: bilisubliveFetch.regexSearchMatch,
    fetch: bilisubliveFetch.regexFetch,
  },
];
