import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
} from 'sp-react-native-in-app-updates';

// eslint-disable-next-line import/no-unresolved
import { APPSTORE } from '@env';
import logger from '@utils/Logger';
import { isAndroid } from '@utils/RNUtils';

export default () => {
  const inAppUpdates = new SpInAppUpdates(
    false, // isDebug
  );

  const checkPlayStoreUpdates = async () => {
    if (!isAndroid || !APPSTORE) return;
    try {
      // curVersion is optional if you don't provide it will automatically take from the app using react-native-device-info
      const result = await inAppUpdates.checkNeedsUpdate();
      if (result.shouldUpdate) {
        let updateOptions: StartUpdateOptions = {};
        if (isAndroid) {
          // android only, on iOS the user will be promped to go to your app store page
          updateOptions = {
            updateType: IAUUpdateKind.FLEXIBLE,
          };
        }
        inAppUpdates.startUpdate(updateOptions); // https://github.com/SudoPlz/sp-react-native-in-app-updates/blob/master/src/types.ts#L78
      }
    } catch {
      logger.error('[PlayStore] checkPlayStoreUpdates failed');
    }
  };

  return { checkPlayStoreUpdates };
};
