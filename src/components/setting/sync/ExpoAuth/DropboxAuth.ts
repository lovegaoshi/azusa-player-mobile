import { Dropbox as _Dropbox } from 'dropbox';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: dropbox didnt have fileBlob in their sdk anywhere but UPGRADING.md
// eslint-disable-next-line import/no-unresolved
import { getArrayBufferForBlob } from 'react-native-blob-jsi-helper';
import { useAuthRequest } from 'expo-auth-session';

// eslint-disable-next-line import/no-unresolved
import { DROPBOX_KEY, DROPBOX_SECRET } from '@env';
import { logger } from '@utils/Logger';
import GenericSyncButton from './GenericSyncButton';
import {
  checkAuthentication,
  noxBackup,
  noxRestore,
} from '@utils/sync/Dropbox';
import { RedirectURL } from '../Enum';

const config = {
  clientId: DROPBOX_KEY,
  clientSecret: DROPBOX_SECRET,
  redirectUrl: RedirectURL,
  redirectUri: RedirectURL,
  scopes: [],
  serviceConfiguration: {
    authorizationEndpoint: 'https://www.dropbox.com/oauth2/authorize',
    tokenEndpoint: 'https://www.dropbox.com/oauth2/token',
  },
};

const useLogin = () => {
  const [, , promptAsync] = useAuthRequest(config, config.serviceConfiguration);
  const login = async (
    callback: () => Promise<void> = async () => undefined,
    errorCallback = logger.error
  ) => {
    try {
      if (!(await checkAuthentication(dbx))) {
        logger.debug('dropbox token expired, need to log in');
        const result = await promptAsync();
        if (result.type === 'success') {
          dbx = new _Dropbox({
            accessToken: result.params.code, //dropboxUID,
          });
        } else {
          errorCallback('[dropbox] auth failed');
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

/**
 * dbx is the dropbox API caller. I initialize it without
 * any access token; when a new token is retrieved via dba,
 * set dbx to a new Drobox object with the correct accesstoken.
 */
let dbx = new _Dropbox({
  accessToken: '',
});

const DropboxSyncButton = ({
  restoreFromUint8Array,
}: NoxSyncComponent.GenericProps) =>
  GenericSyncButton({
    restoreFromUint8Array,
    noxBackup: v => noxBackup(dbx, v),
    noxRestore: () => noxRestore(dbx, async v => getArrayBufferForBlob(v)),
    useLogin,
  });

export default DropboxSyncButton;
