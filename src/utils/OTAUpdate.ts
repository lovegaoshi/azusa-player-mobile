import hotUpdate from 'react-native-ota-hot-update';
import { Alert, Platform } from 'react-native';

export const onCheckGitVersion = () =>
  hotUpdate.git.checkForGitUpdate({
    branch: Platform.OS === 'ios' ? 'IOSOTA' : 'AndroidOTA',
    bundlePath:
      Platform.OS === 'ios' ? 'main.jsbundle' : 'index.android.bundle',
    url: 'https://github.com/lovegaoshi/azusa-player-mobile.git',
    onCloneFailed(msg: string) {
      Alert.alert('Clone project failed!', msg, [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
      ]);
    },
    onCloneSuccess() {
      Alert.alert('Clone project success!', 'Restart to apply the changes', [
        {
          text: 'OK',
          onPress: () => hotUpdate.resetApp(),
        },
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
      ]);
    },
    onPullFailed(msg: string) {
      Alert.alert('Pull project failed!', msg, [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
      ]);
    },
    onPullSuccess() {
      Alert.alert('Pull project success!', 'Restart to apply the changes', [
        {
          text: 'OK',
          onPress: () => hotUpdate.resetApp(),
        },
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
      ]);
    },
  });
