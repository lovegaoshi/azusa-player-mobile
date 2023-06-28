import bfetch from './BiliFetch';
import { logger } from './Logger';

const CHECK_LOGIN_REFRESH_API =
  'https://passport.bilibili.com/x/passport-login/web/cookie/info';
const CORRESPONDPATH_VERCEL = 'https://wasm-rsa.vercel.app/api/rsa';
const REFRESH_CSRF_API =
  'https://www.bilibili.com/correspond/1/{correspondPath}';

export interface LoginInfo {
  name: string;
  id: string;
  avatar: string;
}

export const getLoginStatus = async (
  loginAPI: string,
  loginSuccess: (json: any) => boolean,
  parseJSON: (json: any) => LoginInfo
) => {
  try {
    const response = await bfetch(loginAPI, {
      method: 'GET',
      credentials: 'include',
      headers: {},
    });
    const json = await response.json();
    logger.debug(`get login status: ${JSON.stringify(json)}`);
    if (loginSuccess(json)) {
      return parseJSON(json);
    }
  } catch (e) {
    logger.error(`get login status with ${loginAPI} error: ${e}`);
  }
};

// https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/login/cookie_refresh.md

const checkNeedRefresh = async () => {
  const response = await bfetch(CHECK_LOGIN_REFRESH_API, {
    method: 'GET',
    credentials: 'include',
    headers: {},
  });
  const json = await response.json();
  if (json.code !== 0) {
    logger.warn('checkNeedRefrsh failed; status code is not 0.');
    return false;
  }
  if (!json.data.refresh) return false;
  return json.data.timestamp;
};

const generateCorrespondPath = async (timestamp: string) => {
  // TODO: https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/login/cookie_refresh.md#javascript
  const response = await bfetch(CORRESPONDPATH_VERCEL);
  const json = await response.json();
  return json.hash;
};

const getRefreshCSRF = async (correspondPath: string) => {
  const response = await bfetch(
    REFRESH_CSRF_API.replace('{correspondPath}', correspondPath),
    {
      method: 'GET',
      credentials: 'include',
      headers: {},
    }
  );
};
