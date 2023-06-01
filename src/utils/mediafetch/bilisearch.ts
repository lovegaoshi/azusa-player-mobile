/* eslint-disable prefer-destructuring */
/**
 * refactor:
 * bilisearch workflow:
 * reExtractSearch matches regex patterns and use the corresponding fetch functions;
 * fetch function takes extracted and calls a dataProcess.js fetch function;
 * dataprocess fetch function fetches VIDEOINFO using data.js fetch function, then parses into SONGS
 * data.js fetch function fetches VIDEOINFO.
 * steps to refactor:
 * each site needs a fetch to parse regex extracted, a videoinfo fetcher and a song fetcher.
 */
import { v4 as uuidv4 } from 'uuid';

import { logger } from '../Logger';
import { songFetch } from './bilivideo';
import { fetchBiliPaginatedAPI } from './paginatedbili';
import VideoInfo from '../../objects/VideoInfo';

const URL_BILI_SEARCH =
  'https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword={keyword}&page={pn}';

export const fetchBiliSearchList = async (
  kword: string,
  progressEmitter: (val: number) => void = () => undefined,
  fastSearch = false
) => {
  function timestampToSeconds(timestamp: string) {
    const timeArray = timestamp.split(':').map(parseFloat);
    let seconds = 0;
    if (timeArray.length === 1) {
      // check if both hours and minutes components are missing
      seconds = timeArray[0]; // the timestamp only contains seconds
    } else if (timeArray.length === 2) {
      // check if hours component is missing
      seconds = timeArray[0] * 60 + timeArray[1]; // calculate seconds from minutes and seconds
    } else if (timeArray.length === 3) {
      seconds = timeArray[0] * 3600 + timeArray[1] * 60 + timeArray[2]; // calculate total seconds
    }
    return seconds;
  }

  const fastSearchResolveBVID = async (bvobjs: any[]) => {
    /**
     * cids should be resolved at this stage,
     * or on the fly using fetchCID. the latter saves
     * search time but now song.id loses identification.
    const resolvedCIDs = await Promise.all(
      bvobjs.map(obj => fetchCID(obj.bvid))
    );
     */
    return bvobjs.map(
      (obj, index) =>
        new VideoInfo(
          obj.title.replaceAll(/<[^<>]*em[^<>]*>/g, ''),
          obj.description,
          1,
          `https:${obj.pic}`,
          { mid: obj.mid, name: obj.author, face: obj.upic },
          [
            {
              bvid: obj.bvid,
              part: '1',
              cid: `null-${uuidv4()}`, // resolvedCids[index]
              duration: timestampToSeconds(obj.duration),
            },
          ],
          obj.bvid,
          timestampToSeconds(obj.duration)
        )
    );
  };

  // this API needs a random buvid3 value, or a valid SESSDATA;
  // otherwise will return error 412. for users didnt login to bilibili,
  // setting a random buvid3 would enable this API.
  let val: VideoInfo[] = [];
  try {
    val = await fetchBiliPaginatedAPI({
      url: URL_BILI_SEARCH.replace('{keyword}', kword),
      getMediaCount: data => Math.min(data.numResults, data.pagesize * 2),
      getPageSize: data => data.pagesize,
      getItems: js => js.data.result,
      progressEmitter,
      favList: [],
      params: {
        method: 'GET',
        headers: {
          referer: 'https://www.bilibili.com',
          cookie: 'buvid3=coolbeans',
        },
        credentials: 'omit',
      },
      resolveBiliBVID: fastSearch
        ? async (bvobjs, progressEmitter) => await fastSearchResolveBVID(bvobjs)
        : undefined,
    });
  } catch (e) {
    logger.error(e);
  }
  return val;
};

interface regexFetchProps {
  url: string;
  progressEmitter: (val: number) => void;
  fastSearch: boolean;
}

const regexFetch = async ({
  url,
  progressEmitter = () => undefined,
  fastSearch,
}: regexFetchProps) => {
  return songFetch({
    videoinfos: await fetchBiliSearchList(url, progressEmitter, fastSearch),
    useBiliTag: false,
    progressEmitter,
  });
};

const resolveURL = () => undefined;

const refreshSong = (song: NoxMedia.Song) => song;

export default {
  regexSearchMatch: /space.bilibili\.com\/(\d+)\/video/,
  regexFetch,
  regexResolveURLMatch: /^null-/,
  resolveURL,
  refreshSong,
};
