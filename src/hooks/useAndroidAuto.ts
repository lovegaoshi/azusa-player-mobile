import { Platform, NativeModules } from 'react-native';

import useAlert from '@components/dialogs/useAlert';

const { NoxAndroidAutoModule } = NativeModules;

export default () => {
  const { TwoWayAlert } = useAlert();

  const checkDrawOverAppsPermission = async () => {
    if (
      Platform.OS !== 'android' ||
      (await NoxAndroidAutoModule.getDrawOverAppsPermission())
    ) {
      return;
    }
    TwoWayAlert(
      'Permission Required',
      'Are you using android auto? You need to enable draw over apps permission.',
      () => NoxAndroidAutoModule.askDrawOverAppsPermission()
    );
  };
  return { checkDrawOverAppsPermission };
};
