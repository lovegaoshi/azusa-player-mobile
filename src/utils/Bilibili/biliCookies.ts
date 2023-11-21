import CookieManager from '@react-native-cookies/cookies';

export const getBiliJct = async () =>
  (await CookieManager.get('https://www.bilibili.com'))['bili_jct']?.value;
