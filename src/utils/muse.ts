import * as crypto from 'expo-crypto';
import { get_option } from 'libmuse';

import { getSecure as getItem } from '@utils/ChromeStorageAPI';
import { StorageKeys } from '@enums/Storage';

const findCookie = (cookies: string, match: string) => {
  const cookieArr = cookies.split('; ').map(v => v.split('='));
  return cookieArr.find(cookie => cookie[0] === match)?.[1];
};

export const initMuse = async (
  cookies: Promise<string> = getItem(StorageKeys.YTMCOOKIES),
) => {
  const sapisid = findCookie(await cookies, 'SAPISID') ?? '';
  // https://github.com/sigma67/ytmusicapi/blob/9ce284a7eae9c4cdc04bb098f7549cc5f1c80e22/ytmusicapi/helpers.py#L52
  const get_headers = async () => {
    const now = new Date();
    const timems = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
    const timesec = Math.round(timems / 1000);
    const SAPISIDHASH = await crypto.digestStringAsync(
      crypto.CryptoDigestAlgorithm.SHA1,
      `${timesec} ${sapisid} https://music.youtube.com`,
    );
    return {
      Authorization: `SAPISIDHASH ${timesec}_${SAPISIDHASH}`,
      Cookie: await cookies,
    };
  };
  const auth = get_option('auth');
  auth.get_headers = get_headers;
  auth.requires_login = async () => false;
};
