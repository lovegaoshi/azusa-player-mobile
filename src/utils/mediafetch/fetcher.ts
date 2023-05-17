import Bottleneck from 'bottleneck';
import bfetch from '../BiliFetch';

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
const biliTagApiLimiter = new Bottleneck({
  minTime: 100,
  maxConcurrent: 5,
});

/**
 * resolves fetchbilichannel 509 problem.
 * 509 problem is bilibili started to obfuscate responses of
 * URL_BILICHANNEL_INFO by adding {code:-509,msg:"too many requests"} to the
 * actual response JSON text string. I didnt figure out what is the safe
 * timeout but i assume its a lot. Plus, Bilibili doesnt care and only actually
 * aborts/bans IP until ~200 pages were queried. So the solution is to get the res text,
 * check if it has the code:-509 garbage, remove it, then JSON.parse as usual.
 * assumes special char \n and \r are the only ones to be taken
 * care of. if breaks, use a regex...
 * @param {} res
 * @returns
 */
const extract509Json = async (res: Response) => {
  let resText = await res.text();
  if (resText.includes('"code":-509,')) {
    resText = resText
      .slice(resText.indexOf('}') + 1)
      .replaceAll('\n', '')
      .replaceAll('\r', '');
  }
  return JSON.parse(resText);
};

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
}

export const fetchPaginatedAPI = async ({
  url,
  getMediaCount,
  getPageSize,
  getItems,
  resolveBiliBVID,
  progressEmitter = () => void 0,
  favList = [],
  limiter = biliTagApiLimiter,
  params = undefined,
  jsonify = extract509Json,
}: FetcherProps) => {
  const res = await bfetch(url.replace('{pn}', String(1)), params);
  const { data } = await jsonify(res.clone());
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
      limiter.schedule(() => bfetch(url.replace('{pn}', String(page)), params))
    );
  }
  const resolvedPromises = await Promise.all(pagesPromises);
  await Promise.all(
    resolvedPromises.map(async pages => {
      return jsonify(pages)
        .then((parsedJson: any) => {
          getItems(parsedJson).forEach(m => {
            if (!favList.includes(m.bvid)) BVids.push(m);
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
