/**
 * to set up a personal cloud, make the following API available:
 *
 * /download/{userid/authentication}: used to retrieve backed up json objects.
 * /upload: used to backup json objects. this method sends 3 keys:
 * 1. userid -> an identifier (username from your bilibili account)
 * 2. json_obj -> the actual player setting
 * 3. secret_key -> this app's secret key.
 * for your personal cloud, set an if that restricts only your userid is accepted.
 * check out the fastAPI docker I set up to your router/NAS/VPS to get started.
 *
 */
import axios from 'axios';
// eslint-disable-next-line import/no-unresolved
import { PERSONAL_CLOUD_SECRET } from '@env';

import getBiliUser from '@utils/Bilibili/BiliUser';
import { logger } from '@utils/Logger';

/**
 * a simple personal cloud built with fastAPI. uses the current bili user
 * as "authentication." returns the currently logged in bilibili username.
 * @returns string
 */
const getBiliUserKey = async () => (await getBiliUser()).uname;

/**
 * wraps up find noxplayer setting and download in one function;
 * returns the JSON object of settting or null if not found.
 * @returns playerSetting object, or null
 * @param {string} cloudAddress web address for your personal cloud.
 */
export const noxRestore = async (cloudAddress: string, cloudID?: string) => {
  try {
    // TODO: using axios as the following pr is currently only in react native preview
    // see https://github.com/facebook/react-native/commit/5b597b5ff94953accc635ed3090186baeecb3873
    // and https://stackoverflow.com/questions/76056351/error-filereader-readasarraybuffer-is-not-implemented
    const res = await axios.get(
      `${await cloudAddress}download/${cloudID || (await getBiliUserKey())}`,
      {
        responseType: 'arraybuffer',
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );
    if (res.status === 200) {
      return new Uint8Array(await res.data);
    }
    /**
    const res = await fetch(
      `${await cloudAddress}download/${cloudID || (await getBiliUserKey())}`
    );
    if (res.status === 200) {
      return new Uint8Array(await res.arrayBuffer());
    }
     *
     */
  } catch (e) {
    logger.error(e);
  }
  return null;
};

/**
 * wraps up upload noxplayer setting. returns the response
 * if successful.
 * @param {Object} content
 * @param {string} cloudAddress web address for your personal cloud.
 * @returns
 */
export const noxBackup = async (
  content: Uint8Array,
  cloudAddress: string,
  cloudID?: string
) => {
  try {
    logger.debug(`[personalSync] syncing to ${cloudAddress}`);
    return await fetch(`${cloudAddress}upload`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        userid: encodeURIComponent(cloudID || (await getBiliUserKey())),
        'secret-key': PERSONAL_CLOUD_SECRET,
        'Content-Encoding': 'gzip',
      },
      body: content,
    });
  } catch {
    return { status: 'fetch failed.' };
  }
};
