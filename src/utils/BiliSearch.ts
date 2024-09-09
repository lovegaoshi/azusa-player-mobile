import biliSearchFetch from '@utils/mediafetch/bilisearch';
import ytbVideoFetch from '@utils/mediafetch/ytbvideo';
import localFetch from '@utils/mediafetch/local';
import { MUSICFREE, searcher } from '@utils/mediafetch/musicfree';
import { getMusicFreePlugin } from '@utils/ChromeStorage';
import { SearchOptions } from '@enums/Storage';
import steriatkFetch from './mediafetch/steriatk';
import biliVideoSimilarFetch from './mediafetch/biliVideoSimilar';
import biliBangumiFetch from './mediafetch/biliBangumi';
import biliAudioAMFetch from './mediafetch/biliAudioAM';
import biliAudioColleFetch from './mediafetch/biliAudioColle';
import biliAudioSimilarFetch from './mediafetch/biliAudioSimilar';
import biliVideoFetch from './mediafetch/bilivideo';
import biliAVideoFetch from './mediafetch/biliavideo';
import biliSeriesFetch from './mediafetch/biliseries';
import biliColleFetch from './mediafetch/bilicolle';
import biliFavlistFetch from './mediafetch/bilifavlist';
import biliChannelFetch from './mediafetch/bilichannel';
import biliAudioFetch from './mediafetch/biliaudio';
import biliChannelAudioFetch from './mediafetch/bilichannelAudio';
import ytbPlaylistFetch from './mediafetch/ytbPlaylist';
import ytbMixlistFetch from './mediafetch/ytbmixlist';
import ytbLiveFetch from './mediafetch/ytbLive';
import ytbChannelFetch from './mediafetch/ytbChannel';
import { fetchInnerTuneSearch } from './mediafetch/ytbSearch.muse';
import { fetchYtbiSearch } from './mediafetch/ytbSearch.ytbi';
import biliLiveFetch from './mediafetch/bililive';
import biliSubliveFetch from './mediafetch/bilisublive';
import b23tvFetch from './mediafetch/b23tv';
import headRequestFetch from './mediafetch/headRequest';
import biliFavColleFetch from './mediafetch/biliFavColle';
import alistFetch from './mediafetch/alist';
import { logger } from './Logger';

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
  genericSearch?: boolean;
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
  genericSearch = true,
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
    if (!genericSearch) {
      return results;
    }
    const headRequestResult = await headRequestFetch.regexFetch(input);
    if (headRequestResult) {
      results.songList = [headRequestResult];
    } else {
      // biliSearchFetch
      switch (defaultSearch) {
        case SearchOptions.ALIST:
          results = await alistFetch.regexFetch({
            url: input,
            progressEmitter,
            fastSearch,
            cookiedSearch,
          });
          break;
        case SearchOptions.YOUTUBE:
          results = { songList: await fetchYtbiSearch(input) };
          break;
        case SearchOptions.YOUTUBEM:
          results = { songList: await fetchInnerTuneSearch(input) };
          break;
        case MUSICFREE.aggregated:
          results.songList = await searcher[MUSICFREE.aggregated](
            input,
            await getMusicFreePlugin()
          );
          break;
        default:
          results = await biliSearchFetch.regexFetch({
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
    match: ytbChannelFetch.regexSearchMatch,
    fetch: ytbChannelFetch.regexFetch,
  },
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
    match: biliSeriesFetch.regexSearchMatch,
    fetch: biliSeriesFetch.regexFetch,
  },
  { match: biliColleFetch.regexSearchMatch, fetch: biliColleFetch.regexFetch },
  {
    match: biliChannelFetch.regexSearchMatch,
    fetch: biliChannelFetch.regexFetch,
  },
  {
    match: biliChannelAudioFetch.regexSearchMatch,
    fetch: biliChannelAudioFetch.regexFetch,
  },
  { match: biliAudioFetch.regexSearchMatch, fetch: biliAudioFetch.regexFetch },
  {
    match: biliFavlistFetch.regexSearchMatch,
    fetch: biliFavlistFetch.regexFetch,
  },
  {
    match: biliFavlistFetch.regexSearchMatch2,
    fetch: biliFavlistFetch.regexFetch,
  },
  { match: steriatkFetch.regexSearchMatch, fetch: steriatkFetch.regexFetch },
  { match: steriatkFetch.regexSearchMatch2, fetch: steriatkFetch.regexFetch },
  {
    match: ytbMixlistFetch.regexSearchMatch,
    fetch: ytbMixlistFetch.regexFetch,
    refresh: ytbMixlistFetch.refresh,
  },
  {
    match: ytbMixlistFetch.regexSearchMatch2,
    fetch: ytbMixlistFetch.regexFetch,
    refresh: ytbMixlistFetch.refresh,
  },
  {
    match: ytbPlaylistFetch.regexSearchMatch,
    fetch: ytbPlaylistFetch.regexFetch,
  },
  { match: ytbVideoFetch.regexSearchMatch, fetch: ytbVideoFetch.regexFetch },
  { match: ytbLiveFetch.regexSearchMatch, fetch: ytbLiveFetch.regexFetch },
  { match: biliVideoFetch.regexSearchMatch, fetch: biliVideoFetch.regexFetch },
  {
    match: biliAVideoFetch.regexSearchMatch,
    fetch: biliAVideoFetch.regexFetch,
  },
  { match: biliLiveFetch.regexSearchMatch, fetch: biliLiveFetch.regexFetch },
  {
    match: biliSubliveFetch.regexSearchMatch,
    fetch: biliSubliveFetch.regexFetch,
  },
];
