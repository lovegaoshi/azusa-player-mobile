import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@hooks/useSetting';
import { SettingListItem } from '../useRenderSetting';
import { saveRegextractMapping } from '@utils/ChromeStorage';
import Snackbar from 'react-native-snackbar';

import logger from '@utils/Logger';

interface SnackbarMsg {
  updating: string;
  updated: string;
  updateFail: string;
}

const updateFromGithub = async (msg: SnackbarMsg) => {
  try {
    Snackbar.show({
      text: msg.updating,
      duration: Snackbar.LENGTH_INDEFINITE,
    });
    const json = await (
      await fetch(
        'https://raw.githubusercontent.com/lovegaoshi/azusa-player-mobile/master/src/utils/rejson.json'
      )
    ).json();
    saveRegextractMapping(json);
    Snackbar.show({
      text: msg.updated,
    });
  } catch (e) {
    logger.error(e);
    Snackbar.show({
      text: msg.updateFail,
    });
  }
};

const PluginSettings = () => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const snarbarMsg = (name: string) => ({
    updating: t(`PluginSettings.Updating${name}FromGithub`),
    updated: t(`PluginSettings.Updated${name}FromGithub`),
    updateFail: t(`PluginSettings.UpdateFail${name}FromGithub`),
  });

  return (
    <View
      style={[
        styles.dummySettingsContainer,
        { backgroundColor: playerStyle.customColors.maskedBackgroundColor },
      ]}
    >
      <SettingListItem
        icon={'regex'}
        settingName="RegExp"
        onPress={() => updateFromGithub(snarbarMsg('RegExp'))}
        settingCategory="PluginSettings"
      />
    </View>
  );
};

export default PluginSettings;

const styles = StyleSheet.create({
  dummySettingsContainer: {
    flex: 1,
  },
  dummySettingsText: {
    fontSize: 60,
    paddingLeft: 20,
  },
});
