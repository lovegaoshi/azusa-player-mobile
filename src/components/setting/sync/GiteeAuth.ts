import { authorize } from "react-native-app-auth";

// eslint-disable-next-line import/no-unresolved
import { GITEE_KEY, GITEE_SECRET } from "@env";
import { logger } from "@utils/Logger";
import GenericSyncButton from "./GenericSyncButton";
import { GenericProps } from "./GenericSyncProps";
import { checkAuthentication, noxBackup, noxRestore } from "@utils/sync/Gitee";

const config = {
  redirectUrl: "com.noxplayer://oauthredirect",
  clientId: GITEE_KEY,
  clientSecret: GITEE_SECRET,
  scopes: ["projects", "user_info"],
  additionalHeaders: { Accept: "application/json" },
  serviceConfiguration: {
    authorizationEndpoint: "https://gitee.com/oauth/authorize",
    tokenEndpoint: "https://gitee.com/oauth/token",
  },
};

let authToken = "";

export const getAuth = async (
  callback = () => checkAuthentication(authToken).then(console.log),
  errorHandling = logger.error,
) => {
  const authState = await authorize(config);
  if (authState.accessToken) {
    logger.debug("gitee login successful");
    authToken = authState.accessToken;
    callback();
  } else {
    errorHandling("no response url returned. auth aborted by user.");
  }
};

const login = async (
  callback: () => Promise<void> = async () => undefined,
  errorCallback = logger.error,
) => {
  try {
    if (!(await checkAuthentication())) {
      logger.debug("gitee token expired, need to log in");
      await getAuth(callback, errorCallback);
    } else {
      callback();
    }
    return true;
  } catch (e) {
    logger.debug("gitee fail");
    errorCallback(e);
    return false;
  }
};

const GiteeSyncButton = ({ restoreFromUint8Array }: GenericProps) =>
  GenericSyncButton({
    restoreFromUint8Array,
    noxBackup: (v) => noxBackup(v, authToken),
    noxRestore: () => noxRestore(authToken),
    login,
  });

export default GiteeSyncButton;
