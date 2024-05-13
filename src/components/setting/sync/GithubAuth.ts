import { authorize } from 'react-native-app-auth';

// eslint-disable-next-line import/no-unresolved
import { GITHUB_KEY, GITHUB_SECRET } from '@env';
import { logger } from '@utils/Logger';
import GenericSyncButton from './GenericSyncButton';
import { GenericProps } from './GenericSyncProps';
import { checkAuthentication, noxBackup, noxRestore } from '@utils/sync/Github';

const config = {
  redirectUrl: 'com.noxplayer://oauthredirect',
  clientId: GITHUB_KEY,
  clientSecret: GITHUB_SECRET,
  scopes: ['identity', 'repo', 'administration:write'],
  additionalHeaders: { Accept: 'application/json' },
  serviceConfiguration: {
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    revocationEndpoint: `https://github.com/settings/connections/applications/${GITHUB_KEY}`,
  },
};

let authToken = '';

export const getAuth = async (
  callback = () => checkAuthentication(authToken).then(console.log),
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

export const loginGithub = async (
  callback: () => Promise<void> = async () => undefined,
  errorCallback = logger.error
) => {
  try {
    if (!(await checkAuthentication(authToken))) {
      logger.debug('Github token expired, need to log in');
      await getAuth(callback, errorCallback);
    } else {
      callback();
    }
    return true;
  } catch (e) {
    logger.debug('Github fail');
    errorCallback(e);
    return false;
  }
};

export default ({ restoreFromUint8Array }: GenericProps) =>
  GenericSyncButton({
    restoreFromUint8Array,
    noxBackup: v => noxBackup(v, authToken),
    noxRestore: () => noxRestore(authToken),
    login: loginGithub,
  });
