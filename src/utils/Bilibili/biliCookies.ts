import CookieManager from '@react-native-cookies/cookies';

export enum BILICOOKIES {
  SESSDATA = 'SESSDATA',
  bilijct = 'bili_jct',
}

export const getBiliCookie = async (val = BILICOOKIES.bilijct) =>
  (await CookieManager.get('https://www.bilibili.com'))[val]?.value;

export const getBiliJct = () => getBiliCookie(BILICOOKIES.bilijct);

export const cookieHeader = async (): Promise<RequestInit> => ({
  method: 'GET',
  headers: {
    cookie: `SESSDATA=${await getBiliCookie(BILICOOKIES.SESSDATA)}`,
  },
  referrer: 'https://www.bilibili.com',
  // HACK: setting to omit will use whatever cookie I set above.
  credentials: 'omit',
});
