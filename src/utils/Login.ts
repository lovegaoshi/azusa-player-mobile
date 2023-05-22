import bfetch from './BiliFetch';
import { logger } from './Logger';

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
