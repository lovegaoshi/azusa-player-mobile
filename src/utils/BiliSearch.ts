import { logger } from './Logger';

import { SEARCH_OPTIONS } from '@enums/Storage';
import steriatkFetch from './mediafetch/steriatk';
import bilivideoFetch from './mediafetch/bilivideo';
import biliseriesFetch from './mediafetch/biliseries';
import bilicolleFetch from './mediafetch/bilicolle';
import bilifavlistFetch from './mediafetch/bilifavlist';
import bilichannelFetch from './mediafetch/bilichannel';
import biliaudioFetch from './mediafetch/biliaudio';
import bilisearchFetch from './mediafetch/bilisearch';
import bilichannelAudioFetch from '../utils/mediafetch/bilichannelAudio';
import ytbvideoFetch from './mediafetch/ytbvideo';
import ytbplaylistFetch from './mediafetch/ytbplaylist';
import ytbmixlistFetch from './mediafetch/ytbmixlist';
import ytbsearchFetch from './mediafetch/ytbsearch';
import bililiveFetch from './mediafetch/bililive';
import bilisubliveFetch from './mediafetch/bilisublive';
import { regexFetchProps } from './mediafetch/generic';
import { MUSICFREE, searcher } from './mediafetch/mfsdk';
import { getMusicFreePlugin } from './ChromeStorage';

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
  defaultSearch?: SEARCH_OPTIONS | MUSICFREE;
}

export const matchBiliURL = (input: string) => {
  const reExtractions: Array<
    [RegExp, (props: regexFetchProps) => Promise<NoxMedia.Song[]>]
  > = [
    [biliseriesFetch.regexSearchMatch, biliseriesFetch.regexFetch],
    [bilicolleFetch.regexSearchMatch, bilicolleFetch.regexFetch],
    [bilichannelFetch.regexSearchMatch, bilichannelFetch.regexFetch],
    [bilichannelAudioFetch.regexSearchMatch, bilichannelAudioFetch.regexFetch],
    [biliaudioFetch.regexSearchMatch, biliaudioFetch.regexFetch],
    [bilifavlistFetch.regexSearchMatch, bilifavlistFetch.regexFetch],
    [bilifavlistFetch.regexSearchMatch2, bilifavlistFetch.regexFetch],
    [steriatkFetch.regexSearchMatch, steriatkFetch.regexFetch],
    [steriatkFetch.regexSearchMatch2, steriatkFetch.regexFetch],
    [ytbmixlistFetch.regexSearchMatch, ytbmixlistFetch.regexFetch],
    [ytbmixlistFetch.regexSearchMatch2, ytbmixlistFetch.regexFetch],
    [ytbplaylistFetch.regexSearchMatch, ytbplaylistFetch.regexFetch],
    [ytbvideoFetch.regexSearchMatch, ytbvideoFetch.regexFetch],
    [bilivideoFetch.regexSearchMatch, bilivideoFetch.regexFetch],
    [bililiveFetch.regexSearchMatch, bililiveFetch.regexFetch],
    [bilisubliveFetch.regexSearchMatch, bilisubliveFetch.regexFetch],
  ];
  for (const reExtraction of reExtractions) {
    const reExtracted = reExtraction[0].exec(input);
    if (reExtracted !== null) {
      return { regexFetch: reExtraction[1], reExtracted };
    }
  }
  return null;
};

export const searchBiliURLs = async ({
  input,
  progressEmitter = () => undefined,
  favList = [],
  useBiliTag = false,
  fastSearch = false,
  cookiedSearch = false,
  defaultSearch = SEARCH_OPTIONS.BILIBILI,
}: Props) => {
  try {
    const matchRegex = matchBiliURL(input);
    if (matchRegex !== null) {
      const results = await matchRegex.regexFetch({
        reExtracted: matchRegex.reExtracted,
        progressEmitter,
        favList,
        useBiliTag,
      });
      progressEmitter(0);
      return results;
    } // bilisearchFetch
    let results;
    switch (defaultSearch) {
      case SEARCH_OPTIONS.YOUTUBE:
        results = await ytbsearchFetch.regexFetch({
          url: input,
          progressEmitter,
          fastSearch,
          cookiedSearch,
        });
        break;
      case MUSICFREE.aggregated:
        results = await searcher[MUSICFREE.aggregated](
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
    progressEmitter(0);
    return results;
  } catch (err) {
    logger.warn(err);
  }
  progressEmitter(0);
  return [];
};
