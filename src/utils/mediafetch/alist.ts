import { getAlistCred } from '../alist/storage';
import { logger } from '../Logger';
import { humanishApiLimiter, singleLimiter } from './throttle';
import bfetch from '@utils/BiliFetch';
import SongTS, { DEFAULT_NULL_URL } from '@objects/Song';
import { Source, AcceptableExtensions } from '@enums/MediaFetch';
import { getExt } from '../Utils';

const matchAlistCred = async (site: string) => {
  const credList = await getAlistCred();
  for (const cred of credList) {
    if (cred[0] === site) {
      return cred[1];
    }
  }
  return null;
};

const AListToNoxMedia = (item: any, pathname: string, hostname: string) =>
  SongTS({
    cid: `${Source.alist}-${pathname}/${item.name}`,
    bvid: `${pathname}/${item.name}`,
    name: item.name,
    nameRaw: item.name,
    singer: hostname,
    singerId: hostname,
    cover: '',
    lyric: '',
    source: Source.alist,
    metadataOnReceived: true,
  });

const getCred = async (hostname: string) => {
  const cred = await matchAlistCred(hostname);
  if (cred === null) {
    logger.warn(`[alist] Cred not found for ${hostname}`);
    return '';
  }
  return cred;
};

// here fastsearch acts as if subdir
const fetchAlistMediaContent = async (
  url: string,
  fastSearch = true,
  result: NoxMedia.Song[] = []
) => {
  const { hostname, pathname } = new URL(url);
  const paddedPath = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const parsedPath = decodeURI(`https://1.t/${paddedPath}`).substring(12);
  const cred = await getCred(hostname);
  if (cred === null) return result;
  const payload = {
    page: 1,
    password: cred,
    path: parsedPath,
    per_page: 999999,
    refresh: false,
  };
  const res = await singleLimiter.schedule(() =>
      bfetch(`https://${hostname}/api/fs/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload,
      })
    ),
    json = await res.json();
  if (!json.data) {
    logger.error(`[alist] failed to fetch ${url}: ${json.message}`);
    return result;
  }
  for (const item of json.data.content) {
    if (item.is_dir) {
      if (!fastSearch) {
        result = await fetchAlistMediaContent(
          `${url}/${item.name}`,
          fastSearch,
          result
        );
      }
    } else if (AcceptableExtensions.includes(getExt(item.name) ?? '')) {
      result.push(AListToNoxMedia(item, parsedPath, hostname));
    }
  }
  return result;
};

const resolveURL = async (song: NoxMedia.Song) => {
  const cred = await getCred(String(song.singerId));
  if (cred !== null) {
    try {
      const payload = {
        password: cred,
        path: song.bvid,
      };
      const res = await humanishApiLimiter.schedule(() =>
          bfetch(`https://${song.singerId}/api/fs/get`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: payload,
          })
        ),
        json = await res.json();
      return { url: json.data.raw_url };
    } catch {
      logger.error(`[alist] failed to resolve ${song.singerId}${song.bvid}`);
    }
  }
  return { url: DEFAULT_NULL_URL };
};

const regexFetch = async ({
  url,
  fastSearch = true,
}: NoxNetwork.BiliSearchFetchProps): Promise<NoxNetwork.NoxRegexFetch> => ({
  songList: await fetchAlistMediaContent(url, fastSearch),
});

export default {
  regexFetch,
  resolveURL,
  regexResolveURLMatch: /^alist-/,
};
