import { useTranslation } from 'react-i18next';

import SettingListItem from '../helpers/SettingListItem';
import useSnack from '@stores/useSnack';
import { onCheckGitVersion } from '@utils/OTAUpdate';

export default () => {
  const setSnack = useSnack(state => state.setSnack);
  const { t } = useTranslation();

  return (
    <SettingListItem
      icon={'update'}
      settingName="OTAU"
      onPress={() =>
        setSnack({
          snackMsg: {
            processing: t('OTA.running'),
            success: t('OTA.success'),
            fail: t('OTA.failed'),
          },
          processFunction: onCheckGitVersion,
        })
      }
      settingCategory="DeveloperSettings"
    />
  );
};
