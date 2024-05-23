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
import { logger } from "../Logger";
import { regexFetchProps } from "./generic";
import { fetchAwaitBiliPaginatedAPI } from "./paginatedbili";
import { awaitLimiter } from "./throttle";
import { getDm } from "../Bilibili/bilidm";
import { biliShazamOnSonglist } from "./bilishazam";

const URL_BILICHANNEL_INFO =
  "https://api.bilibili.com/x/space/wbi/arc/search?mid={mid}&pn={pn}&jsonp=jsonp&ps=50";

export const fetchBiliChannelList = async (
  url: string,
  progressEmitter: (val: number) => void = () => undefined,
  favList: string[] = [],
) => {
  logger.info("calling fetchBiliChannelList");
  const mid = /space.bilibili\.com\/(\d+)(\/search)?\/video/.exec(url)![1];
  let searchAPI = URL_BILICHANNEL_INFO.replace("{mid}", mid!);
  const urlObj = new URL(url);
  const URLParams = new URLSearchParams(urlObj.search);
  const tidVal = URLParams.get("tid");
  if (tidVal) {
    searchAPI += `&tid=${tidVal}`;
  }
  const kwVal = URLParams.get("keyword");
  if (kwVal) {
    searchAPI += `&keyword=${kwVal}`;
  }
  return fetchAwaitBiliPaginatedAPI({
    url: searchAPI + getDm(),
    getMediaCount: (data) => data.page.count,
    getPageSize: (data) => data.page.ps,
    getItems: (js) => js.data.list.vlist,
    progressEmitter,
    favList,
    limiter: awaitLimiter,
  });
};

const regexFetch = async ({
  reExtracted,
  progressEmitter = () => undefined,
  favList,
  useBiliTag,
}: regexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => ({
  songList: await biliShazamOnSonglist(
    await fetchBiliChannelList(reExtracted.input, progressEmitter, favList),
    false,
    progressEmitter,
    useBiliTag || false,
  ),
});

const resolveURL = () => undefined;

export default {
  regexSearchMatch: /space.bilibili\.com\/(\d+)(\/search)?\/video/,
  regexFetch,
  regexResolveURLMatch: /^null-/,
  resolveURL,
};
