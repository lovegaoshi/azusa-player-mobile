import { authorize } from 'react-native-app-auth';
import { fromByteArray, toByteArray } from 'base64-js';

// eslint-disable-next-line import/no-unresolved
import { GITHUB_KEY, GITHUB_SECRET } from '@env';
import bfetch from '@utils/BiliFetch';
import { logger } from '@utils/Logger';
import GenericSyncButton from './GenericSyncButton';
import { GenericProps } from './GenericSyncProps';

const APM_REPO_NAME = 'APMCloudSync';
const APM_FILE_NAME = 'APM.noxbackup';

const config = {
  redirectUrl: 'com.noxplayer://oauthredirect',
  clientId: GITHUB_KEY,
  clientSecret: GITHUB_SECRET,
  scopes: ['identity', 'repo'],
  additionalHeaders: { Accept: 'application/json' },
  serviceConfiguration: {
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    revocationEndpoint: `https://github.com/settings/connections/applications/${GITHUB_KEY}`,
  },
};

let authToken = '';

export const getAuth = async (
  callback = () => checkAuthentication().then(console.log),
  errorHandling = logger.error
) => {
  const authState = await authorize(config);
  if (authState.accessToken) {
    logger.debug('github login successful');
    authToken = authState.accessToken;
    callback();
  } else {
    errorHandling('no response url returned. auth aborted by user.');
  }
};

export const getUserName = async (token = authToken) => {
  const res = await bfetch(
    `https://gitee.com/api/v5/user?access_token=${token}`
  );
  const data = await res.json();
  return data.name;
};

export const createAPMRepo = async (token = authToken) => {
  return await bfetch('https://gitee.com/api/v5/user/repos', {
    method: 'POST',
    body: {
      access_token: token,
      name: APM_REPO_NAME,
      auto_init: true,
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

export const syncToGitee = async ({
  token = authToken,
  username,
  content,
}: {
  token?: string;
  content: Uint8Array;
  username?: string;
}) => {
  if (username === undefined) {
    username = await getUserName(token);
  }
  logger.debug(`[gitee] start syncing ${username}`);
  await createAPMRepo();
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

export const noxBackup = async (content: Uint8Array) => {
  return await syncToGitee({ content });
};

const checkAuthentication = async () => {
  try {
    if ((await getUserName()) === undefined) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};

export const loginGitee = async (
  callback: () => Promise<void> = async () => undefined,
  errorCallback = logger.error
) => {
  try {
    if (!(await checkAuthentication())) {
      logger.debug('gitee token expired, need to log in');
      await getAuth(callback, errorCallback);
    } else {
      callback();
    }
    return true;
  } catch (e) {
    logger.debug('gitee fail');
    errorCallback(e);
    return false;
  }
};

/**
 * wraps up find noxplayer setting and download in one function;
 * returns the JSON object of settting or null if not found.
 * @returns playerSetting object, or null
 */
const noxRestore = async () => {
  const res = await bfetch(
    `https://gitee.com/api/v5/repos/${await getUserName()}/${APM_REPO_NAME}/contents/${APM_FILE_NAME}?access_token=${authToken}`
  );
  const noxFile = (await res.json()).content;
  if (!noxFile) {
    throw new Error('noxfile is not found on dropbox.');
  }
  return toByteArray(noxFile);
};

const GiteeSyncButton = ({ restoreFromUint8Array }: GenericProps) =>
  GenericSyncButton({
    restoreFromUint8Array,
    noxBackup,
    noxRestore,
    login: loginGitee,
  });

export default GiteeSyncButton;
