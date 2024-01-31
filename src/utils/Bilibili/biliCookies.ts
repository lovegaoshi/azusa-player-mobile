import CookieManager from '@react-native-cookies/cookies';

export enum BILICOOKIES {
  SESSDATA = 'SESSDATA',
  bilijct = 'bili_jct',
}

export const getBiliCookie = async (val = 'bili_jct') =>
  (await CookieManager.get('https://www.bilibili.com'))[val]?.value;

export const getBiliJct = async () =>
  (await CookieManager.get('https://www.bilibili.com'))['bili_jct']?.value;

export const BiliCookieHeader = async () => {
  const SESSDATA = await getBiliCookie('SESSDATA');
  if (!SESSDATA) {
    return;
  }
  return {
    method: 'GET',
    headers: {
      cookie: `SESSDATA=${SESSDATA}`,
    },
    referrer: 'https://www.bilibili.com',
    // HACK: setting to omit will use whatever cookie I set above.
    credentials: 'omit',
  };
};
