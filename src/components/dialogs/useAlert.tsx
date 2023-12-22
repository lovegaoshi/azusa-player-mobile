import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

export default () => {
  const { t } = useTranslation();

  const ThreeWayAlert = (
    title: string,
    message: string,
    onSubmit: () => void,
    partialTitle: string,
    onPartial: () => void
  ) =>
    Alert.alert(title, message, [
      {
        text: String(t('Dialog.cancel')),
        onPress: () => undefined,
        style: 'cancel',
      },
      {
        text: partialTitle,
        onPress: onPartial,
      },
      {
        text: String(t('Dialog.ok')),
        onPress: onSubmit,
      },
    ]);

  const TwoWayAlert = (title: string, message: string, onSubmit: () => void) =>
    Alert.alert(title, message, [
      {
        text: String(t('Dialog.cancel')),
        onPress: () => undefined,
        style: 'cancel',
      },
      {
        text: String(t('Dialog.ok')),
        onPress: onSubmit,
      },
    ]);
  const OneWayAlert = (
    title: string,
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onPress = () => {}
  ) =>
    Alert.alert(
      title,
      message,
      [{ text: String(t('Dialog.ok')), onPress: onPress }],
      {
        cancelable: true,
        onDismiss: onPress,
      }
    );

  return {
    OneWayAlert,
    TwoWayAlert,
    ThreeWayAlert,
  };
};
