/* eslint-disable @typescript-eslint/no-explicit-any */
import Bottleneck from 'bottleneck';
import { biliApiLimiter } from './throttle';
import VideoInfo from '@objects/VideoInfo';
import bfetch from '../BiliFetch';

/**
 * the purpose of this media fetch library is to
 * 1. migrate to ts;
 * 2. we already modularize BiliSearch via reExtractSearch. we can do better.
 * 3. we can do something like musicfree plugins too.... with simplicity, no
 * top10, search artist crap. though it is handy. but still. id rather do it by
 * regex.
 */

type ProgressEmitter = (progress: number) => void;

export interface FetcherProps {
  url: string;
  getMediaCount: (val: any) => number;
  getPageSize: (val: any) => number;
  getItems: (val: any) => Array<any>;
  resolveBiliBVID?: (
    bvobjs: any,
    progressEmitter: ProgressEmitter
  ) => Promise<VideoInfo[]>;
  progressEmitter?: ProgressEmitter;
  favList?: Array<any>;
  limiter?: Bottleneck;
  params?: any;
  jsonify?: (val: any) => any;
  getBVID?: (val: any) => any;
  getJSONData?: (json: any) => any;
  fetcher?: (url: string, params?: any) => Promise<Response>;
}

/**
 * generic paginated API resolver.
 * using biliChannel for dev example:
 * API url can be found here:
 *
 */
export const fetchPaginatedAPI = async ({
  url,
  getMediaCount,
  getPageSize,
  getItems,
  resolveBiliBVID = async () => [],
  progressEmitter = () => undefined,
  favList = [],
  limiter = biliApiLimiter,
  params = undefined,
  jsonify = res => res.json(),
  getBVID = (val: any) => val.bvid,
  getJSONData = (json: any) => json.data,
  fetcher = bfetch,
}: FetcherProps) => {
  const res = await fetcher(url.replace('{pn}', String(1)), params);
  const data = getJSONData(await jsonify(res.clone()));
  const mediaCount = getMediaCount(data);
  const BVids: string[] = [];
  const pagesPromises: Promise<Response>[] = [
    new Promise(resolve => {
      resolve(res);
    }),
  ];
  for (
    let page = 2, n = Math.ceil(mediaCount / getPageSize(data));
    page <= n;
    page++
  ) {
    pagesPromises.push(
      limiter.schedule(() => fetcher(url.replace('{pn}', String(page)), params))
    );
  }
  const resolvedPromises = await Promise.all(pagesPromises);
  await Promise.all(
    resolvedPromises.map(async pages => {
      return jsonify(pages)
        .then((parsedJson: any) => {
          getItems(parsedJson).forEach(m => {
            if (!favList.includes(getBVID(m))) BVids.push(m);
          });
        })
        .catch((err: any) => {
          console.error(err, pages);
          pages.text().then(console.log);
        });
    })
  );
  // i dont know the smart way to do this out of the async loop, though luckily that O(2n) isnt that big of a deal
  const resolvedBiliBVID = await resolveBiliBVID(BVids, progressEmitter);
  return resolvedBiliBVID.filter(item => item);
};

/**
 * instead of fetching all pages with promise.all,
 * this fetches pages with for of and achieves process
 * control to stop fetching when the first bvid is encountered.
 */
export const fetchAwaitPaginatedAPI = async ({
  url,
  getMediaCount,
  getPageSize,
  getItems,
  resolveBiliBVID = async () => [],
  progressEmitter = () => undefined,
  favList = [],
  limiter = biliApiLimiter,
  params = undefined,
  jsonify = res => res.json(),
  getBVID = (val: any) => val.bvid,
  fetcher = bfetch,
  getJSONData = (json: any) => json.data,
}: FetcherProps) => {
  // helper function that returns true if more page resolving is needed.
  const resolvePageJson = async (BVids: string[], json: any) => {
    for (const item of getItems(json)) {
      if (favList.includes(getBVID(item))) {
        return false;
      }
      BVids.push(item);
    }
    return true;
  };
  const res = await limiter.schedule(() =>
    fetcher(url.replace('{pn}', String(1)), params)
  );
  const json = await jsonify(res);
  const data = getJSONData(json);
  const mediaCount = getMediaCount(data);
  const BVids: any[] = [];

  if (await resolvePageJson(BVids, json)) {
    for (
      let page = 2, n = Math.ceil(mediaCount / getPageSize(data));
      page <= n;
      page++
    ) {
      const subRes = await limiter.schedule(() =>
        fetcher(url.replace('{pn}', String(page)), params)
      );
      const subJson = await subRes.json();
      if (!(await resolvePageJson(BVids, subJson))) {
        break;
      }
    }
  }
  // i dont know the smart way to do this out of the async loop, though luckily that O(2n) isnt that big of a deal
  return (await resolveBiliBVID(BVids, progressEmitter)).filter(item => item);
};
