import i18n from 'i18next';

import notifee from '@notifee/react-native';

let channel: string;
const ID = 'APM-download-notification';

const init = async () => {
  if (channel !== undefined) {
    return;
  }

  // Create a channel (required for Android)
  channel = await notifee.createChannel({
    id: 'APM-download',
    name: 'APM Download Notification',
  });
};

export const displayDLProgress = async (
  song: NoxMedia.Song,
  progress?: number,
) => {
  await init();
  await notifee.displayNotification({
    id: ID,
    title: i18n.t('Download.downloadingNotifTitle'),
    body: i18n.t('Download.downloadingNotif', { song, progress }),
    android: {
      channelId: channel,

      progress: {
        max: 100,
        current: progress ?? 0,
        indeterminate: progress === undefined,
      },
    },
  });
};

export const displayDLComplete = async (song: NoxMedia.Song) => {
  await init();
  const notificationId = await notifee.displayNotification({
    id: ID,
    title: i18n.t('Download.downloadingNotifCompleteTitle'),
    body: i18n.t('Download.downloadingNotifComplete', { song }),
    android: {
      channelId: channel,
    },
  });
  setTimeout(() => {
    notifee.cancelNotification(notificationId);
  }, 5000);
};
