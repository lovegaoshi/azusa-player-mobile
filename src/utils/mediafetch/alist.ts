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
      return [cred[1], cred[2]];
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
  result: NoxMedia.Song[] = [],
) => {
  const { hostname, pathname, searchParams } = new URL(url);
  const parsedSearchParams = Object.fromEntries(searchParams.entries());
  const searchSubfolder = !fastSearch || parsedSearchParams.sub !== undefined;
  const paddedPath = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const parsedPath = decodeURI(`https://1.t/${paddedPath}`).substring(12);
  const cred = await getCred(hostname);
  if (cred === null) return result;
  const payload = {
    page: 1,
    password: cred[0],
    path: parsedPath,
    per_page: 999999,
    refresh: false,
  };
  const res = await singleLimiter.schedule(() =>
      bfetch(`https://${hostname}/${cred[1] ?? ''}api/fs/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload,
      }),
    ),
    json = await res.json();
  if (!json.data) {
    logger.error(`[alist] failed to fetch ${url}: ${json.message}`);
    return result;
  }
  for (const item of json.data.content) {
    if (item.is_dir) {
      if (searchSubfolder) {
        result = await fetchAlistMediaContent(
          `${url.split('?')[0]}/${item.name}`,
          searchSubfolder,
          result,
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
        password: cred[0],
        path: song.bvid,
      };
      const res = await humanishApiLimiter.schedule(() =>
          bfetch(`https://${song.singerId}/${cred[1] ?? ''}api/fs/get`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: payload,
          }),
        ),
        json = await res.json();
      return { url: json.data.raw_url.replaceAll('http://', 'https://') };
    } catch {
      logger.error(`[alist] failed to resolve ${song.singerId}${song.bvid}`);
    }
  }
  return { url: DEFAULT_NULL_URL };
};

const urlSearch = async ({
  url,
  fastSearch = true,
}: NoxNetwork.BiliSearchFetchProps): Promise<NoxNetwork.NoxRegexFetch> => ({
  songList: await fetchAlistMediaContent(url, fastSearch),
  subscribeUrl: [url.startsWith('alist://') ? url : `alist://${url}`],
});

const regexFetch = ({ reExtracted }: NoxNetwork.RegexFetchProps) => {
  return urlSearch({ url: reExtracted[1] });
};

export default {
  regexSearchMatch: /^alist:\/\/(.+)$/,
  regexFetch,
  urlSearch,
  resolveURL,
  regexResolveURLMatch: /^alist-/,
};
