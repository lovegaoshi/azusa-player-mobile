import { useAuthRequest } from 'expo-auth-session';
import { getArrayBufferForBlob } from 'react-native-blob-jsi-helper';

// eslint-disable-next-line import/no-unresolved
import { GITHUB_KEY, GITHUB_SECRET } from '@env';
import { logger } from '@utils/Logger';
import GenericSyncButton from './GenericSyncButton';
import { checkAuthentication, noxBackup, noxRestore } from '@utils/sync/Github';
import { RedirectURL } from '../Enum';

const config = {
  redirectUrl: RedirectURL,
  redirectUri: RedirectURL,
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

const useLogin = () => {
  const [, , promptAsync] = useAuthRequest(config, config.serviceConfiguration);
  const login = async (
    callback: () => Promise<void> = async () => undefined,
    errorCallback = logger.error
  ) => {
    try {
      if (!(await checkAuthentication())) {
        logger.debug('github token expired, need to log in');
        const result = await promptAsync();
        if (result.type === 'success') {
          authToken = result.params.code;
        } else {
          errorCallback('[Github] auth failed');
        }
      } else {
        callback();
      }
      return true;
    } catch (e) {
      errorCallback(e);
      return false;
    }
  };
  return { login };
};
export default ({ restoreFromUint8Array }: NoxSyncComponent.GenericProps) =>
  GenericSyncButton({
    restoreFromUint8Array,
    noxBackup: v => noxBackup(v, authToken),
    noxRestore: () =>
      noxRestore(authToken, async v => getArrayBufferForBlob(v)),
    useLogin,
  });
