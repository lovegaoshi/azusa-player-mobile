import { getArrayBufferForBlob } from 'react-native-blob-jsi-helper';
import { loadAsync, exchangeCodeAsync } from 'expo-auth-session';

// eslint-disable-next-line import/no-unresolved
import { GITHUB_KEY, GITHUB_SECRET } from '@env';
import { logger } from '@utils/Logger';
import GenericSyncButton from './GenericSyncButton';
import { checkAuthentication, noxBackup, noxRestore } from '@utils/sync/Github';
import { RedirectUrl } from './Enums';

const config = {
  redirectUrl: RedirectUrl,
  redirectUri: RedirectUrl,
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
  const authReq = await loadAsync(config, config.serviceConfiguration);
  const authState = await authReq.promptAsync(config.serviceConfiguration);
  if (authState.type !== 'success') {
    errorHandling(authState);
    return;
  }
  const accessTokenState = await exchangeCodeAsync(
    { code: authState.params.code, ...config },
    config.serviceConfiguration
  );
  if (accessTokenState.accessToken) {
    logger.debug('github login successful');
    authToken = accessTokenState.accessToken;
    callback();
  } else {
    errorHandling('no response url returned. auth aborted by user.');
  }
};

export const login = async (
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

export default ({ restoreFromUint8Array }: NoxSyncComponent.GenericProps) =>
  GenericSyncButton({
    restoreFromUint8Array,
    noxBackup: v => noxBackup(v, authToken),
    noxRestore: () =>
      noxRestore(authToken, async v => getArrayBufferForBlob(v)),
    login,
  });
