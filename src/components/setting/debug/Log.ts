import { Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { getLog, resetLog } from '@utils/Logger';

export default (logs = getLog()) => {
  Alert.alert(
    'Log',
    logs,
    [
      { text: 'Clear', onPress: () => resetLog() },
      { text: 'Copy', onPress: () => Clipboard.setStringAsync(logs) },
      { text: 'OK', onPress: () => undefined },
    ],
    { cancelable: true },
  );
};
