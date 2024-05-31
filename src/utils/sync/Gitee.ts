import { fromByteArray, toByteArray } from 'base64-js';

import bfetch from '@utils/BiliFetch';
import { logger } from '@utils/Logger';

export const APM_REPO_NAME = 'APMCloudSync';
export const APM_FILE_NAME = 'APM.noxbackup';

const getUserName = async (token: string) => {
  const res = await bfetch(
    `https://gitee.com/api/v5/user?access_token=${token}`
  );
  const data = await res.json();
  return data.name;
};

const createAPMRepo = async (token: string) => {
  return await bfetch('https://gitee.com/api/v5/user/repos', {
    method: 'POST',
    body: {
      // @ts-ignore HACK: for noxplayer's compatibility
      access_token: token,
      name: APM_REPO_NAME,
      auto_init: true,
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

const syncToGitee = async ({
  token,
  username,
  content,
}: {
  token: string;
  content: Uint8Array;
  username?: string;
}) => {
  username = username ?? (await getUserName(token));
  logger.debug(`[gitee] start syncing ${username}`);
  await createAPMRepo(token);
  logger.debug('[gitee] created repo');
  const res = await bfetch(
    `https://gitee.com/api/v5/repos/${username}/${APM_REPO_NAME}/contents/%2F?access_token=${token}`
  );
  const data = await res.json();
  logger.debug(`[gitee] file fetched: ${data.sha}`);
  if (res.status === 200) {
    logger.debug('[gitee] updating backup file');
    for (const repofile of data) {
      if (repofile.name === APM_FILE_NAME) {
        // do something
        return await bfetch(
          `https://gitee.com/api/v5/repos/${username}/${APM_REPO_NAME}/contents/${APM_FILE_NAME}`,
          {
            method: 'PUT',
            body: {
              // @ts-ignore HACK: for noxplayer's compatibility
              access_token: token,
              message: `noxbackup - ${new Date().getTime()}`,
              content: fromByteArray(content),
              sha: repofile.sha,
            },
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
      }
    }
  }
  logger.debug('[gitee] creating backup file');
  // file doesnt exist. create instaed.
  return await bfetch(
    `https://gitee.com/api/v5/repos/${username}/${APM_REPO_NAME}/contents/${APM_FILE_NAME}`,
    {
      method: 'POST',
      body: {
        // @ts-ignore HACK: for noxplayer's compatibility
        access_token: token,
        message: `noxbackup - ${new Date().getTime()}`,
        content: fromByteArray(content),
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
};
// https://gitee.com/api/v5/swagger#/getV5ReposOwnerRepoContents(Path)

export const noxBackup = (content: Uint8Array, token: string) =>
  syncToGitee({ content, token });

export const checkAuthentication = async (token = '') => {
  try {
    if ((await getUserName(token)) === undefined) {
      return false;
    }
    return true;
  } catch (e) {
    logger.warn(`[sync] gitee auth failed:${e}`);
    return false;
  }
};

/**
 * wraps up find noxplayer setting and download in one function;
 * returns the JSON object of settting or null if not found.
 * @returns playerSetting object, or null
 */
export const noxRestore = async (token: string) => {
  const res = await bfetch(
    `https://gitee.com/api/v5/repos/${await getUserName(
      token
    )}/${APM_REPO_NAME}/contents/${APM_FILE_NAME}?access_token=${token}`
  );
  const noxFile = (await res.json()).content;
  if (!noxFile) {
    throw new Error('noxfile is not found on dropbox.');
  }
  return toByteArray(noxFile);
};
