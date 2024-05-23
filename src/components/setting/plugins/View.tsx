import * as React from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { useNoxSetting } from "@stores/useApp";
import { SettingListItem } from "../useRenderSetting";
import { saveRegextractMapping } from "@utils/ChromeStorage";
import { downloadR128GainDB } from "./r128gain/Sync";
import useSnack from "@stores/useSnack";
import MusicFreeButton from "./MusicFreeButton";

const updateFromGithub = async () => {
  const json = await (
    await fetch(
      "https://raw.githubusercontent.com/lovegaoshi/azusa-player-mobile/master/src/utils/rejson.json",
    )
  ).json();
  saveRegextractMapping(json);
};

const PluginSettings = () => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting((state) => state.playerStyle);
  const setSnack = useSnack((state) => state.setSnack);
  const updateWithSnack = (
    name: string,
    processFunction: () => Promise<void>,
  ) => {
    setSnack({
      snackMsg: {
        processing: t(`PluginSettings.Updating${name}FromGithub`),
        success: t(`PluginSettings.Updated${name}FromGithub`),
        fail: t(`PluginSettings.UpdateFail${name}FromGithub`),
      },
      processFunction,
    });
  };

  return (
    <View
      style={[
        styles.dummySettingsContainer,
        { backgroundColor: playerStyle.customColors.maskedBackgroundColor },
      ]}
    >
      <SettingListItem
        icon={"regex"}
        settingName="RegExp"
        onPress={() => updateWithSnack("RegExp", updateFromGithub)}
        settingCategory="PluginSettings"
      />
      <SettingListItem
        icon={"cloud-sync"}
        settingName="R128Gain"
        onPress={() => updateWithSnack("R128Gain", downloadR128GainDB)}
        settingCategory="PluginSettings"
      />
      <MusicFreeButton />
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
