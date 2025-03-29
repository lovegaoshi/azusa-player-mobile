import { fetchPaginatedAPI } from './paginatedfetch';
import { fetchBiliBVIDs } from './bilivideo';
import { fetchBiliSeriesList } from './biliseries';
import { fetchBiliColleList } from './bilicolle';
import { filterUndefined, i0hdslbHTTPResolve } from '../Utils';

/**
 * https://api.bilibili.com/x/polymer/web-space/seasons_series_list?mid=529249&page_size=20&page_num=1
 */
export const fetchLists = async (mid: string) => {
  const API = `https://api.bilibili.com/x/polymer/web-space/seasons_series_list?mid=${mid}&page_size=20&page_num={pn}`;
  return fetchPaginatedAPI({
    url: API,
    getMediaCount: v => v.items_lists.page.total,
    getPageSize: v => v.items_lists.page.page_size,
    getItems: (js: any) => [
      ...js.data.items_lists.seasons_list,
      ...js.data.items_lists.series_list,
    ],
    getBVID: v => v,
  }) as Promise<any[]>;
};

// HACK: its only the top 5 videos from the list
export const getBVIDFast = async (mid: string) => {
  const list = await fetchLists(mid);
  return list
    .reduce((acc, curr) => {
      acc.push(curr.archives.map((v: any) => v.bvid));
      return acc;
    }, [])
    .flat();
};

const resolveBiliList = async (mid: string, list: any) => {
  if (list.meta.season_id) {
    return fetchBiliColleList(mid, list.meta.season_id);
  }
  if (list.meta.series_id) {
    return fetchBiliBVIDs(await fetchBiliSeriesList(mid, list.meta.series_id));
  }
  return [];
};

export const getListAsYTSongRowCard = async (mid: string) => {
  const list = await fetchLists(mid);
  return filterUndefined(
    list.map((v: any) => ({
      cover: i0hdslbHTTPResolve(v.meta.cover),
      name: v.meta.name,
      singer: v.meta.total,
      getPlaylist: async () => ({
        songs: await resolveBiliList(mid, v),
      }),
    })),
    v => v,
  );
};

export const getListSongs = async (mid: string) => {
  const list = await fetchLists(mid);
  const result = await Promise.all(
    list.map((v: any) => resolveBiliList(mid, v)),
  );
  return result.flat();
};

const regexFetch = async ({
  reExtracted,
}: NoxNetwork.RegexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => {
  return {
    songList: await getListSongs(reExtracted[1]),
  };
};

export default {
  // https://space.bilibili.com/20159625/lists
  regexSearchMatch: /space.bilibili.com\/(\d+)\/lists/,
  regexFetch,
};
