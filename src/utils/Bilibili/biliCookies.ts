import CookieManager from '@react-native-cookies/cookies';

export enum BILICOOKIES {
  SESSDATA = 'SESSDATA',
  bilijct = 'bili_jct',
}

export const getBiliCookie = async (val = 'bili_jct') =>
  (await CookieManager.get('https://www.bilibili.com'))[val]?.value;

export const getBiliJct = async () =>
  (await CookieManager.get('https://www.bilibili.com'))['bili_jct']?.value;
