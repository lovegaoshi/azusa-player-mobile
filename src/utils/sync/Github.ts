import { fromByteArray } from 'base64-js';

import bfetch from '@utils/BiliFetch';
import { logger } from '@utils/Logger';
import { APM_FILE_NAME, APM_REPO_NAME } from './Gitee';

const githubAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export const getUserName = async (token: string) => {
  const res = await bfetch('https://api.github.com/user', {
    headers: githubAuthHeader(token),
  });
  const data = await res.json();
  return data.login;
};

export const createAPMRepo = (token: string) =>
  bfetch('https://api.github.com/user/repos', {
    method: 'POST',
    body: JSON.stringify({
      name: APM_REPO_NAME,
      private: true,
    }),
    headers: {
      ...githubAuthHeader(token),
      'Content-Type': 'application/json',
    },
  });

export const sync = async ({
  token,
  username,
  content,
}: {
  token: string;
  content: Uint8Array;
  username?: string;
}) => {
  username = username ?? (await getUserName(token));
  logger.debug(`[github] start syncing ${username}`);
  await createAPMRepo(token);
  logger.debug('[github] created repo');
  logger.debug('[github] creating backup file');
  const fpath = `https://api.github.com/repos/${username}/${APM_REPO_NAME}/contents/${APM_FILE_NAME}`;
  const probeFileRes = await bfetch(fpath, {
    headers: githubAuthHeader(token),
  });
  const probeFile = await probeFileRes.json();
  // file doesnt exist. create instaed.
  return bfetch(
    `https://api.github.com/repos/${username}/${APM_REPO_NAME}/contents/${APM_FILE_NAME}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        message: `noxbackup - ${new Date().getTime()}`,
        content: fromByteArray(content),
        sha: probeFile.sha,
      }),
      headers: githubAuthHeader(token),
    },
  );
};

export const noxBackup = (content: Uint8Array, token: string) =>
  sync({ content, token });

export const checkAuthentication = async (token = '') => {
  try {
    if ((await getUserName(token)) === undefined) {
      return false;
    }
    return true;
  } catch (e) {
    logger.warn(`[sync] github auth failed:${e}`);
    return false;
  }
};

export const noxRestore = async (
  token: string,
  contentParse: (v: Blob) => Promise<Uint8Array>,
) => {
  const res = await bfetch(
    `https://api.github.com/repos/${await getUserName(token)}/${APM_REPO_NAME}/contents/${APM_FILE_NAME}`,
    {
      headers: {
        ...githubAuthHeader(token),
        Accept: 'application/vnd.github.raw+json',
      },
    },
  );
  const noxFile = await res.blob();
  if (!noxFile) {
    throw new Error('noxfile is not found on github.');
  }
  return contentParse(noxFile);
};
