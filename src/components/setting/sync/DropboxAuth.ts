import { Dropbox as _Dropbox } from "dropbox";
import { authorize } from "react-native-app-auth";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: dropbox didnt have fileBlob in their sdk anywhere but UPGRADING.md
// eslint-disable-next-line import/no-unresolved
import { getArrayBufferForBlob } from "react-native-blob-jsi-helper";

// eslint-disable-next-line import/no-unresolved
import { DROPBOX_KEY, DROPBOX_SECRET } from "@env";
import { logger } from "@utils/Logger";
import GenericSyncButton from "./GenericSyncButton";
import { GenericProps } from "./GenericSyncProps";
import {
  checkAuthentication,
  noxBackup,
  noxRestore,
} from "@utils/sync/Dropbox";

const config = {
  clientId: DROPBOX_KEY,
  clientSecret: DROPBOX_SECRET,
  // change this in android/app/build.gradle
  redirectUrl: "com.noxplayer://oauth",
  scopes: [],
  serviceConfiguration: {
    authorizationEndpoint: "https://www.dropbox.com/oauth2/authorize",
    tokenEndpoint: "https://www.dropbox.com/oauth2/token",
  },
};

/**
 * dbx is the dropbox API caller. I initialize it without
 * any access token; when a new token is retrieved via dba,
 * set dbx to a new Drobox object with the correct accesstoken.
 */
let dbx = new _Dropbox({
  accessToken: "",
});

/**
 * this method attempts to login dropbox. the accesstoken can be
 * further processed in the callback function as a part of the
 * returned url from chrome.identity.launchWebAuthFlow.
 */
const getAuth = async (
  callback = () => checkAuthentication(dbx).then(console.log),
  errorHandling = logger.error,
) => {
  const authState = await authorize(config);
  const dropboxUID = authState.tokenAdditionalParameters?.account_id;
  if (dropboxUID) {
    dbx = new _Dropbox({
      accessToken: authState.accessToken, //dropboxUID,
    });
    callback();
  } else {
    errorHandling("no response url returned. auth aborted by user.");
  }
};

/**
 * Check if dropbox token is valid by performing a simple
 * userGetCurrentAccount API request. if fails, acquire the token
 * again via getAuth. afterwards, the callback function is chained.
 * put noxRestore/noxBackup as callback in this function to ensure
 * user is logged in via dropbox before these operations.
 */
const login = async (
  callback: () => Promise<void> = async () => undefined,
  errorCallback = logger.error,
) => {
  try {
    if (!(await checkAuthentication(dbx))) {
      logger.debug("dropbox token expired, need to log in");
      await getAuth(callback, errorCallback);
    } else {
      callback();
    }
    return true;
  } catch (e) {
    errorCallback(e);
    return false;
  }
};

const DropboxSyncButton = ({ restoreFromUint8Array }: GenericProps) =>
  GenericSyncButton({
    restoreFromUint8Array,
    noxBackup: (v) => noxBackup(dbx, v),
    noxRestore: () => noxRestore(dbx, async (v) => getArrayBufferForBlob(v)),
    login,
  });

export default DropboxSyncButton;
