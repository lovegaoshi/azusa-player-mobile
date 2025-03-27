import { fetchPaginatedAPI } from './paginatedfetch';
import { fetchBiliBVIDs } from './bilivideo';

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

export const getBVID = async (mid: string) => {
  const list = await fetchLists(mid);
  return list.reduce(
    (acc, curr) => [...acc, ...curr.archives.map((v: any) => v.bvid)],
    [],
  );
};

const regexFetch = async ({
  reExtracted,
}: NoxNetwork.RegexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => {
  const bvids = await getBVID(reExtracted[1]);
  return {
    songList: await fetchBiliBVIDs(bvids),
  };
};

export default {
  // https://space.bilibili.com/20159625/lists
  regexSearchMatch: /space.bilibili.com\/(\d+)\/lists/,
  regexFetch,
};
