import hotUpdate from 'react-native-ota-hot-update';
import { Alert, Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

const url =
  Platform.OS === 'ios'
    ? 'https://github.com/lovegaoshi/azusa-player-mobile/raw/refs/heads/OTA/main.jsbundle.zip'
    : 'https://github.com/lovegaoshi/azusa-player-mobile/raw/refs/heads/OTA/index.android.bundle.zip';

export const onCheckGitVersion = () =>
  hotUpdate.downloadBundleUri(ReactNativeBlobUtil, url, undefined, {
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
