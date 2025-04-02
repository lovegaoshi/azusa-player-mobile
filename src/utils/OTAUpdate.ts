import hotUpdate from 'react-native-ota-hot-update';
import { Alert, Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

// eslint-disable-next-line import/no-unresolved
import { LOCKHASH } from '@env';
import logger from './Logger';

const url =
  Platform.OS === 'ios'
    ? 'https://github.com/lovegaoshi/azusa-player-mobile/raw/refs/heads/OTA/main.jsbundle.zip'
    : 'https://github.com/lovegaoshi/azusa-player-mobile/raw/refs/heads/OTA/index.android.bundle.zip';

export const onCheckGitVersion = async () => {
  const req = await fetch(
    'https://raw.githubusercontent.com/lovegaoshi/azusa-player-mobile/refs/heads/OTA/yarn.hash',
  );
  const txt = await req.text();
  if (txt !== LOCKHASH) {
    logger.error(`[NoxOTA] OTA's ${txt} does not match current: ${LOCKHASH}`);
    throw new Error('[NoxOTA] OTA yarn.lock version mismatch!');
  }
  return hotUpdate.downloadBundleUri(ReactNativeBlobUtil, url, undefined, {
    progress: console.log,
    updateSuccess: () => {
      console.log('Update successful!');
    },
    updateFail: message => {
      Alert.alert('Update failed!', String(message), [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
      ]);
    },
    restartAfterInstall: true,
  });
};
