import CookieManager from '@react-native-cookies/cookies';

import { sendBVFavorite } from './BiliOperate';
import bfetch from '@utils/BiliFetch';
import { getFavListBVID } from '../mediafetch/bilifavlist';
import { humanishApiLimiter } from '../mediafetch/throttle';
import getBiliUser from '@utils/Bilibili/BiliUser';
import { getPlaylistUniqBVIDs } from '@objects/Playlist';

const BILI_GETFAVLIST_API =
  'https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid={mid}';
const BILI_CREFAVLIST_API = 'https://api.bilibili.com/x/v3/fav/folder/add';

// https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid=3493085134719196
// not sure what fid means...
export interface GETFAVLIST_RES {
  id: number;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// if len === 0 then create!
export const getBiliFavlist = async (
  usermid?: string,
  matchingTitle?: string
) => {
  const user = usermid ? { mid: usermid } : await getBiliUser();
  if (!user.mid) return [];
  const res = await fetch(BILI_GETFAVLIST_API.replace('{mid}', user.mid));
  const json = await res.json();
  const favlists = json.data.list as GETFAVLIST_RES[];
  return matchingTitle
    ? favlists.filter(val => val.title === matchingTitle)
    : favlists;
};

export const createBiliFavlist = async (title: string) => {
  const biliJct = (await CookieManager.get('https://www.bilibili.com'))[
    'bili_jct'
  ]?.value;
  if (!biliJct) {
    throw new Error('no cookie');
  }
  const res = await bfetch(BILI_CREFAVLIST_API, {
    credentials: 'include',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    referrer: 'https://www.bilibili.com/',
    body: {
      title,
      csrf: biliJct,
    },
  });
  const json = await res.json();
  return json.data.id;
};

const getOrInsertBiliFavlist = async (
  matchingTitle: string,
  usermid?: string
) => {
  const getResult = await getBiliFavlist(usermid, matchingTitle);
  if (getResult.length > 0) {
    return getResult[0]!.id;
  }
  return createBiliFavlist(matchingTitle);
};

export const addToBiliFavlist = async (
  favlistid: string,
  bvids: string[],
  progressEmitter: (val: number) => void = () => undefined
) => {
  const sendBVLikeEmitter = async (
    bvid: string,
    like: string[],
    unlike: string[],
    progressEmitterFn: () => void
  ) => {
    await sendBVFavorite(bvid, like, unlike);
    progressEmitterFn();
  };
  const favedbvids = await getFavListBVID(favlistid);
  // unlike with a throttler
  await Promise.all(
    favedbvids
      .filter(val => !bvids.includes(val))
      .map((val, i, arr) =>
        humanishApiLimiter.schedule(() =>
          sendBVLikeEmitter(val, [], [favlistid], () =>
            progressEmitter((i * 100) / arr.length)
          )
        )
      )
  );
  // like
  await Promise.all(
    bvids
      .filter(val => !favedbvids.includes(val))
      .map((val, i, arr) =>
        humanishApiLimiter.schedule(() =>
          sendBVLikeEmitter(val, [favlistid], [], () =>
            progressEmitter((i * 100) / arr.length)
          )
        )
      )
  );
};

export const syncFavlist = async (
  favlist: NoxMedia.Playlist,
  progressEmitter: (val: number) => void = () => undefined
) => {
  const user = await getBiliUser();
  if (!user.mid) return false;
  const favid = await getOrInsertBiliFavlist(
    favlist.title.slice(0, 19),
    user.mid
  );
  const uniqBVIDs = getPlaylistUniqBVIDs(favlist);
  await addToBiliFavlist(
    favid,
    uniqBVIDs.filter(val => val.startsWith('BV')),
    progressEmitter
  );
  return true;
};
