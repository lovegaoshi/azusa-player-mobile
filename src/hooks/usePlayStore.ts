import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
} from 'sp-react-native-in-app-updates';
import notifee from '@notifee/react-native';
import i18n from 'i18next';

// eslint-disable-next-line import/no-unresolved
import { APPSTORE } from '@env';
import logger from '@utils/Logger';
import { isAndroid } from '@utils/RNUtils';

const ID = 'APM-inapp-update-notification';

export default function usePlayStore() {
  const inAppUpdates = new SpInAppUpdates(
    false, // isDebug
  );

  const checkPlayStoreUpdates = async () => {
    if (!isAndroid || !APPSTORE || __DEV__) return;
    try {
      // curVersion is optional if you don't provide it will automatically take from the app using react-native-device-info
      const result = await inAppUpdates.checkNeedsUpdate();
      if (result.shouldUpdate) {
        let updateOptions: StartUpdateOptions = {};
        let channel: string = '';
        if (isAndroid) {
          // Create a channel (required for Android)
          channel = await notifee.createChannel({
            id: 'APM-inapp-update',
            name: 'APM In App Update Notification',
          });
          // android only, on iOS the user will be promped to go to your app store page
          updateOptions = {
            updateType: IAUUpdateKind.FLEXIBLE,
          };
        }
        inAppUpdates.addStatusUpdateListener(async s => {
          const progressOptions =
            s.bytesDownloaded >= s.totalBytesToDownload
              ? undefined
              : {
                  max: 1,
                  current: s.bytesDownloaded / s.totalBytesToDownload,
                };
          const notificationId = await notifee.displayNotification({
            id: ID,
            title: i18n.t('InAppUpdate.Title'),
            body: i18n.t('InAppUpdate.body'),
            android: {
              channelId: channel,
              progress: progressOptions,
            },
          });
          if (s.bytesDownloaded >= s.totalBytesToDownload) {
            inAppUpdates.installUpdate();
            setTimeout(() => {
              notifee.cancelNotification(notificationId);
            }, 5000);
          }
        });
        await inAppUpdates.startUpdate(updateOptions); // https://github.com/SudoPlz/sp-react-native-in-app-updates/blob/master/src/types.ts#L78
      }
    } catch {
      logger.error('[PlayStore] checkPlayStoreUpdates failed');
    }
  };

  return { checkPlayStoreUpdates };
}
