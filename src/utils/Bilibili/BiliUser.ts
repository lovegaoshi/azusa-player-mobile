import { logger } from '@utils/Logger';

/**
 * a simple personal cloud built with fastAPI. uses the current bili user
 * as "authentication." returns the currently logged in bilibili username.
 * @returns dict.
 */
export default async () => {
  try {
    const val = await fetch('https://api.bilibili.com/x/web-interface/nav');
    const res = await val.json();
    return res.data;
  } catch (e) {
    logger.error(
      `[personalSync] failed to get bilibili login info. returning an empty dict instead.: ${e}`
    );
    return { uname: '' };
  }
};
