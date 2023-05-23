import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { useNoxSetting } from './useSetting';
import useAlert from '../components/dialogs/useAlert';
import { VERSIONS } from '../enums/Version';

export default () => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);
  const { OneWayAlert, TwoWayAlert } = useAlert();
  const { t } = useTranslation();

  const getVersion = async () => {
    try {
      const res = await fetch(
        'https://api.github.com/repos/lovegaoshi/azusa-player-mobile/releases/latest'
      );
      const json = await res.json();
      const noxCheckedVersion = json.tag_name;
      setPlayerSetting({ noxCheckedVersion });
      return noxCheckedVersion;
    } catch {
      return null;
    }
  };

  const checkVersion = async (
    auto = true,
    currentPlayerSetting = playerSetting
  ) => {
    if (!auto) {
      Snackbar.show({
        text: t('VersionUpdate.UpdateCheckingSnackbar'),
        duration: Snackbar.LENGTH_INDEFINITE,
      });
    }
    const noxCheckedVersion = await getVersion();
    Snackbar.dismiss();
    if (!noxCheckedVersion) {
      Snackbar.show({
        text: t('VersionUpdate.UpdateCheckingFailedSnackbar'),
      });
      return;
    }
    if (noxCheckedVersion === currentPlayerSetting.noxCheckedVersion && auto)
      return;
    if (noxCheckedVersion === currentPlayerSetting.noxVersion) {
      OneWayAlert(
        '',
        String(
          t('VersionUpdate.NoUpdates', {
            currentVersion: currentPlayerSetting.noxVersion,
          })
        )
      );
    } else {
      setPlayerSetting({ noxCheckedVersion });
      TwoWayAlert(
        String(t('VersionUpdate.UpdateFoundTitle')),
        String(
          t('VersionUpdate.UpdateFoundContent', {
            noxCheckedVersion,
            currentVersion: currentPlayerSetting.noxVersion,
          })
        ),
        () =>
          Linking.openURL(
            'https://github.com/lovegaoshi/azusa-player-mobile/releases/latest'
          )
      );
    }
  };

  const updateVersion = async (currentPlayerSetting = playerSetting) => {
    const latest = VERSIONS.latest;
    switch (currentPlayerSetting.noxVersion) {
      case latest:
        return;
      default:
        setPlayerSetting({ noxVersion: latest });
        console.debug(`version update to ${latest}d`);
        OneWayAlert(
          String(t('VersionUpdate.UpdatedVersionAlertTitle')),
          String(
            t('VersionUpdate.UpdatedVersionAlertContent', { version: latest })
          )
        );
    }
  };
  return { checkVersion, updateVersion };
};
