import RNFetchBlob from 'react-native-blob-util';
import { useTranslation } from 'react-i18next';

import useSnack from '../stores/useSnack';

const android = RNFetchBlob.android;

export default function useInstallAPK() {
  const { t } = useTranslation();
  const setSnack = useSnack(state => state.setSnack);

  const RNFetchDownloadAPK = async (url: string) => {
    setSnack({ snackMsg: { success: t('VersionUpdate.DownloadingAPK') } });
    await RNFetchBlob.config({
      addAndroidDownloads: {
        useDownloadManager: true, // <-- this is the only thing required
        description: t('VersionUpdate.DownloadingAPK'),
        notification: true,
        // Title of download notification
        title: t('VersionUpdate.DownloadedAPK'),
        mime: 'application/vnd.android.package-archive',
      },
    })
      .fetch('GET', url)
      .then(res => {
        setSnack({ snackMsg: { success: t('VersionUpdate.DownloadedAPK') } });
        android.actionViewIntent(
          res.path(),
          'application/vnd.android.package-archive',
        );
      })
      .catch();
  };
  return { RNFetchDownloadAPK };
}
