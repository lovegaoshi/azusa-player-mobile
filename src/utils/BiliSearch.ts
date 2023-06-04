import { logger } from './Logger';

import steriatkFetch from './mediafetch/steriatk';
import bilivideoFetch from './mediafetch/bilivideo';
import biliseriesFetch from './mediafetch/biliseries';
import bilicolleFetch from './mediafetch/bilicolle';
import bilifavlistFetch from './mediafetch/bilifavlist';
import bilichannelFetch from './mediafetch/bilichannel';
import biliaudioFetch from './mediafetch/biliaudio';
import bilisearchFetch from './mediafetch/bilisearch';
import bilichannelAudioFetch from '../utils/mediafetch/bilichannelAudio';
import { regexFetchProps } from './mediafetch/generic';

/**
 * assign the proper extractor based on the provided url. uses regex.
 * @returns
 */
interface props {
  input: string;
  progressEmitter?: (progress: number) => void;
  favList?: string[];
  useBiliTag?: boolean;
  fastSearch?: boolean;
}

export const searchBiliURLs = async ({
  input,
  progressEmitter = val => undefined,
  favList = [],
  useBiliTag = false,
  fastSearch = false,
}: props) => {
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
    [bilivideoFetch.regexSearchMatch, bilivideoFetch.regexFetch],
  ];
  let results = [];
  try {
    for (const reExtraction of reExtractions) {
      const reExtracted = reExtraction[0].exec(input);
      if (reExtracted !== null) {
        results = await reExtraction[1]({
          reExtracted,
          progressEmitter,
          favList,
          useBiliTag,
        });
        progressEmitter(0);
        return results;
      }
    }
    results = await bilisearchFetch.regexFetch({
      url: input,
      progressEmitter,
      fastSearch,
    });
    progressEmitter(0);
    return results;
  } catch (err) {
    logger.warn(err);
  }
  progressEmitter(0);
  return [];
};

/**
   [
      /youtu(?:.*\/v\/|.*v=|\.be\/)([A-Za-z0-9_-]{11})/,
      ({ reExtracted }) => getYoutubeVideo({ bvid: reExtracted[1] }),
    ],
 */
