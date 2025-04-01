import hotUpdate from 'react-native-ota-hot-update';
import { Alert, Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

export const onCheckGitVersion = () =>
  hotUpdate.downloadBundleUri(ReactNativeBlobUtil, url, undefined, {
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
