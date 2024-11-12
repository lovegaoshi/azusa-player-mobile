import { logger } from '@utils/Logger';

/**
 * a simple personal cloud built with fastAPI. uses the current bili user
 * as "authentication." returns the currently logged in bilibili username.
 * @returns dict.
 */
const getUser = async () => {
  try {
    const val = await fetch('https://api.bilibili.com/x/web-interface/nav');
    const res = await val.json();
    return res.data;
  } catch (e) {
    logger.error(
      `[personalSync] failed to get bilibili login info. returning an empty dict instead.: ${e}`,
    );
    return { uname: '' };
  }
};

const getUserGuard = async () => {
  const uid = (await getUser()).mid;
  const res = await fetch(
    `https://api.live.bilibili.com/xlive/web-ucenter/user/MedalWall?target_id=${uid}`,
  );
  const data = await res.json();

  return data.data.list;
};

// simple function that filters is user has guard > 0.
export const getHasGuard = async (hasGuard: number[] = []) => {
  const guards = await getUserGuard();
  return guards.filter(
    (guard: any) => guard.guard_level > 0 && hasGuard.includes(guard.target_id),
  );
};

export default getUser;
