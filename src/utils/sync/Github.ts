import { fromByteArray, toByteArray } from 'base64-js';

import bfetch from '@utils/BiliFetch';
import { logger } from '@utils/Logger';
import { APM_FILE_NAME, APM_REPO_NAME } from './Gitee';

const githubAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export const getUserName = async (token: string) => {
  const res = await bfetch(`https://api.github.com/user`, {
    headers: githubAuthHeader(token),
  });
  const data = await res.json();
  return data.login;
};

export const createAPMRepo = async (token: string) => {
  return await bfetch('https://api.github.com/user/repos', {
    method: 'POST',
    body: {
      name: APM_REPO_NAME,
      private: true,
    },
    headers: {
      ...githubAuthHeader(token),
      'Content-Type': 'application/json',
    },
  });
};

export const syncToGithub = async ({
  token,
  username,
  content,
}: {
  token: string;
  content: Uint8Array;
  username?: string;
}) => {
  if (username === undefined) {
    username = await getUserName(token);
  }
  logger.debug(`[github] start syncing ${username}`);
  await createAPMRepo(token);
  logger.debug('[github] created repo');
  logger.debug('[github] creating backup file');
  // file doesnt exist. create instaed.
  return await bfetch(
    `https://api.github.com/repos/${username}/${APM_REPO_NAME}/contents/${APM_FILE_NAME}`,
    {
      method: 'POST',
      body: {
        message: `noxbackup - ${new Date().getTime()}`,
        content: fromByteArray(content),
      },
      headers: githubAuthHeader(token),
    }
  );
};

export const noxBackup = async (content: Uint8Array, token: string) => {
  return await syncToGithub({ content, token });
};

export const checkAuthentication = async (token = '') => {
  try {
    if ((await getUserName(token)) === undefined) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};

export const noxRestore = async (token: string) => {
  const res = await bfetch(
    `https://api.github.com/repos/${await getUserName(token)}/${APM_REPO_NAME}/contents/${APM_FILE_NAME}`
  );
  const noxFile = (await res.json()).content;
  if (!noxFile) {
    throw new Error('noxfile is not found on dropbox.');
  }
  return toByteArray(noxFile);
};
