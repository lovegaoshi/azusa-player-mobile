import { Platform, NativeModules } from 'react-native';
import { useTranslation } from 'react-i18next';

import useAlert from '@components/dialogs/useAlert';
import { getItem, saveItem } from '@utils/ChromeStorage';
import { StorageKeys } from '@enums/Storage';
// eslint-disable-next-line import/no-unresolved
import { APPSTORE } from '@env';

const { NoxAndroidAutoModule } = NativeModules;

export default () => {
  const { TwoWayAlert } = useAlert();
  const { t } = useTranslation();

  const checkDrawOverAppsPermission = async () => {
    if (
      !APPSTORE ||
      Platform.OS !== 'android' ||
      (await NoxAndroidAutoModule.getDrawOverAppsPermission()) ||
      (await getItem(StorageKeys.AA_PERMISSION)) !== null
    ) {
      return;
    }
    TwoWayAlert('Android Auto', t('AndroidAuto.Permission'), () =>
      NoxAndroidAutoModule.askDrawOverAppsPermission()
    );
    saveItem(StorageKeys.AA_PERMISSION, true);
  };
  return { checkDrawOverAppsPermission };
};
