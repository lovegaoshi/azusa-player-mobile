/* eslint-disable @typescript-eslint/no-explicit-any */
import Bottleneck from 'bottleneck';
import bfetch from '../BiliFetch';
import { wbiQuery } from '@stores/wbi';

/**
 * the purpose of this media fetch library is to
 * 1. migrate to ts;
 * 2. we already modularize BiliSearch via reExtractSearch. we can do better.
 * 3. we can do something like musicfree plugins too.... with simplicity, no
 * top10, search artist crap. though it is handy. but still. id rather do it by
 * regex.
 */

/**
 * default throttler, 100ms/call using bottleneck,
 * max 5 concurrent
 */
const pageAPILimiter = new Bottleneck({
  minTime: 100,
  maxConcurrent: 5,
});

type ProgressEmitter = (progress: number) => void;

interface FetcherProps {
  url: string;
  getMediaCount: (val: any) => number;
  getPageSize: (val: any) => number;
  getItems: (val: any) => Array<any>;
  resolveBiliBVID: (
    bvobjs: any,
    progressEmitter: ProgressEmitter
  ) => Promise<NoxMedia.Song[]>;
  progressEmitter?: ProgressEmitter;
  favList?: Array<any>;
  limiter?: Bottleneck;
  params?: any;
  jsonify?: (val: any) => any;
  getBVID?: (val: any) => any;
  getJSONData?: (json: any) => any;
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
  resolveBiliBVID,
  progressEmitter = () => undefined,
  favList = [],
  limiter = pageAPILimiter,
  params = undefined,
  jsonify = res => res.json(),
  getBVID = (val: any) => val.bvid,
  getJSONData = (json: any) => json.data,
}: FetcherProps) => {
  const wbiAwareFetch = url.includes('/wbi/') ? wbiQuery : bfetch;
  const res = await wbiAwareFetch(url.replace('{pn}', String(1)), params);
  const data = getJSONData(await jsonify(res.clone()));
  const mediaCount = getMediaCount(data);
  const BVids: string[] = [];
  const pagesPromises: Promise<Response>[] = [
    new Promise(resolve => resolve(res)),
  ];
  for (
    let page = 2, n = Math.ceil(mediaCount / getPageSize(data));
    page <= n;
    page++
  ) {
    pagesPromises.push(
      limiter.schedule(() =>
        wbiAwareFetch(url.replace('{pn}', String(page)), params)
      )
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
  return (await resolveBiliBVID(BVids, progressEmitter)).filter(
    item => item !== undefined
  );
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
  resolveBiliBVID,
  progressEmitter = () => undefined,
  favList = [],
  limiter = pageAPILimiter,
  params = undefined,
  jsonify = res => res.json(),
  getBVID = (val: any) => val.bvid,
  getJSONData = (json: any) => json.data,
}: FetcherProps) => {
  const res = await bfetch(url.replace('{pn}', String(1)), params);
  const data = getJSONData(await jsonify(res));
  const mediaCount = getMediaCount(data);
  const BVids: string[] = [];
  const resolvePage = async () => {
    for (
      let page = 1, n = Math.ceil(mediaCount / getPageSize(data));
      page <= n;
      page++
    ) {
      try {
        const pageRes = (await limiter.schedule(() =>
          bfetch(url.replace('{pn}', String(page)), params)
        )) as Response;
        const parsedJson = await jsonify(pageRes);
        for (const m of getItems(parsedJson)) {
          if (favList.includes(getBVID(m))) {
            return;
          }
          BVids.push(m);
        }
      } catch (e) {
        console.error('resolving page in fetchAwaitedPaginatedAPI', e);
      }
    }
  };
  await resolvePage();
  // i dont know the smart way to do this out of the async loop, though luckily that O(2n) isnt that big of a deal
  return (await resolveBiliBVID(BVids, progressEmitter)).filter(
    item => item !== undefined
  );
};
