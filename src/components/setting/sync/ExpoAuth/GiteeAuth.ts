import { useAuthRequest } from 'expo-auth-session';

// eslint-disable-next-line import/no-unresolved
import { GITEE_KEY, GITEE_SECRET } from '@env';
import { logger } from '@utils/Logger';
import GenericSyncButton from './GenericSyncButton';
import { checkAuthentication, noxBackup, noxRestore } from '@utils/sync/Gitee';
import { RedirectURL } from '../Enum';

const config = {
  redirectUrl: RedirectURL,
  redirectUri: RedirectURL,
  clientId: GITEE_KEY,
  clientSecret: GITEE_SECRET,
  scopes: ['projects', 'user_info'],
  additionalHeaders: { Accept: 'application/json' },
  serviceConfiguration: {
    authorizationEndpoint: 'https://gitee.com/oauth/authorize',
    tokenEndpoint: 'https://gitee.com/oauth/token',
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
        logger.debug('gitee token expired, need to log in');
        const result = await promptAsync();
        if (result.type === 'success') {
          authToken = result.params.code;
        } else {
          errorCallback('[Gitee] auth failed');
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

const GiteeSyncButton = ({
  restoreFromUint8Array,
}: NoxSyncComponent.GenericProps) =>
  GenericSyncButton({
    restoreFromUint8Array,
    noxBackup: v => noxBackup(v, authToken),
    noxRestore: () => noxRestore(authToken),
    useLogin,
  });

export default GiteeSyncButton;
