import { logger } from '../Logger';
import { bvFetch } from './bilivideo';
import biliaudioFetch from './biliaudio';

const URL_FAV_LIST =
  'https://api.bilibili.com/x/v3/fav/resource/ids?media_id={mid}';

interface BiliFavListData {
  id: number;
  type: number;
  bv_id: string;
  bvid: string;
}

const getFavList = async (mid: string) => {
  logger.info('calling fetchFavList');

  const res = await fetch(URL_FAV_LIST.replace('{mid}', mid));
  const json = await res.json();
  const data = json.data as BiliFavListData[];
  return data;
};

export const getFavListBVID = async (
  mid: string,
  favList: string[] = [],
  type = 2
) => {
  const data = await getFavList(mid);
  return data
    .filter(val => val.type === type)
    .map(val => val.bvid)
    .filter(val => !favList.includes(val));
};

const regexFetch = async ({
  reExtracted,
  progressEmitter = () => undefined,
  favList = [],
  useBiliTag,
}: NoxNetwork.RegexFetchProps) => {
  // TODO: refactor this???
  const favFetched = await getFavList(reExtracted[1]);
  const bvids = favFetched
    .filter(val => val.type === 2)
    .map(val => val.bvid)
    .filter(val => !favList.includes(val));
  // HACK: https://api.bilibili.com/x/v3/fav/resource/ids?media_id=2446762296
  const avids = favFetched
    .filter(val => val.type === 12)
    .map(val => String(val.id))
    .filter(val => !favList.includes(val));

  const BVfetched = await bvFetch({
    bvids,
    useBiliTag: useBiliTag || false,
    progressEmitter,
    reExtracted: [] as unknown as RegExpExecArray,
  });

  const AVfetched = await Promise.all(
    avids.map(avid =>
      biliaudioFetch.regexFetch({
        reExtracted: [0, Number(avid)] as unknown as RegExpExecArray,
      })
    )
  );
  return {
    songList: BVfetched.songList.concat(AVfetched.map(v => v.songList).flat()),
  };
};

const resolveURL = () => undefined;

export default {
  regexSearchMatch: /.*bilibili\.com\/\d+\/favlist\?fid=(\d+)/,
  regexSearchMatch2: /.*bilibili\.com\/medialist\/detail\/ml(\d+)/,
  regexFetch,
  regexResolveURLMatch: /^null-/,
  resolveURL,
};
