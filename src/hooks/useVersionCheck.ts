import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';
// eslint-disable-next-line import/no-unresolved
import { APPSTORE } from '@env';

import { useNoxSetting } from '@stores/useApp';
import useAlert from '../components/dialogs/useAlert';
import { Versions } from '../enums/Version';
import logger from '@utils/Logger';
import useInstallAPK from './useInstallAPK';
import useSnack, { InfiniteDuration } from '../stores/useSnack';
import { isAndroid } from '@utils/RNUtils';
import { getVersion as _getVersion } from '@utils/versionCheck';

const regexVersion = (version: string) => {
  const regexMatch = /\d+\.\d+\.\d+/.exec(version),
    regexVersion = regexMatch ? regexMatch[0] : null;
  return regexVersion;
};

export default () => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const setSnack = useSnack(state => state.setSnack);
  const snackDismiss = useSnack(state => state.snackDismiss);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);
  const { OneWayAlert, TwoWayAlert, ThreeWayAlert } = useAlert();
  const { RNFetchDownloadAPK } = useInstallAPK();
  const { t } = useTranslation();

  const getVersion = async () => {
    const res = await _getVersion();
    setPlayerSetting({ noxCheckedVersion: res.noxCheckedVersion });
    return res;
  };

  const checkVersion = async (
    auto = true,
    currentPlayerSetting = playerSetting,
  ) => {
    if (APPSTORE) return;
    if (!auto) {
      setSnack({
        snackMsg: { success: t('VersionUpdate.UpdateCheckingSnackbar') },
        snackDuration: InfiniteDuration,
      });
    }
    const { noxCheckedVersion, devVersion, noxAPKUrl } = await getVersion();
    await snackDismiss();
    if (!noxCheckedVersion) {
      setSnack({
        snackMsg: { success: t('VersionUpdate.UpdateCheckingFailedSnackbar') },
      });
      return;
    }
    if (noxCheckedVersion === currentPlayerSetting.noxCheckedVersion && auto)
      return;
    if (
      regexVersion(noxCheckedVersion) ===
      regexVersion(currentPlayerSetting.noxVersion)
    ) {
      OneWayAlert(
        '',
        String(
          t('VersionUpdate.NoUpdates', {
            currentVersion: currentPlayerSetting.noxVersion,
            devVersion,
          }),
        ),
      );
    } else {
      setPlayerSetting({ noxCheckedVersion });
      if (isAndroid) {
        ThreeWayAlert(
          t('VersionUpdate.UpdateFoundTitle'),
          String(
            t('VersionUpdate.UpdateFoundContent', {
              noxCheckedVersion,
              currentVersion: currentPlayerSetting.noxVersion,
              devVersion,
            }),
          ),
          () =>
            Linking.openURL(
              'https://github.com/lovegaoshi/azusa-player-mobile/releases/latest',
            ),
          t('VersionUpdate.DownloadAPK'),
          () => RNFetchDownloadAPK(noxAPKUrl!),
        );
        return;
      }
      TwoWayAlert(
        t('VersionUpdate.UpdateFoundTitle'),
        String(
          t('VersionUpdate.UpdateFoundContent', {
            noxCheckedVersion,
            currentVersion: currentPlayerSetting.noxVersion,
            devVersion,
          }),
        ),
        () =>
          Linking.openURL(
            'https://github.com/lovegaoshi/azusa-player-mobile/releases/latest',
          ),
      );
    }
  };

  const updateVersion = (currentPlayerSetting = playerSetting) => {
    const latest = Versions.Latest;
    switch (currentPlayerSetting.noxVersion) {
      case latest:
        return;
      default:
        setPlayerSetting({ noxVersion: latest });
        logger.debug(`version update to ${latest}d`);
        OneWayAlert(
          t('VersionUpdate.UpdatedVersionAlertTitle'),
          String(
            t('VersionUpdate.UpdatedVersionAlertContent', { version: latest }),
          ),
        );
    }
  };
  return { checkVersion, updateVersion };
};
