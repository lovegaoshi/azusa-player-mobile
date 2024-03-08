import RNFetchBlob from 'react-native-blob-util';
import { useTranslation } from 'react-i18next';
import Snackbar from 'react-native-snackbar';

const android = RNFetchBlob.android;

export default () => {
  const { t } = useTranslation();

  const RNFetchDownloadAPK = async (url: string) => {
    Snackbar.show({
      text: t('VersionUpdate.DownloadingAPK'),
    });
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
        Snackbar.show({
          text: t('VersionUpdate.DownloadedAPK'),
        });
        android.actionViewIntent(
          res.path(),
          'application/vnd.android.package-archive'
        );
      })
      .catch();
  };
  return { RNFetchDownloadAPK };
};
