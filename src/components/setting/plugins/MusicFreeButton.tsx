import * as React from "react";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";

import GenericCheckDialog from "@components/dialogs/GenericCheckDialog";
import { SettingListItem } from "../useRenderSetting";
import { MUSICFREE } from "@utils/mediafetch/musicfree";
import { getMusicFreePlugin, setMusicFreePlugin } from "@utils/ChromeStorage";
import { StyleSheet } from "react-native";

export default () => {
  const { t } = useTranslation();
  const [visible, setVisible] = React.useState(false);
  const [favLists] = React.useState<MUSICFREE[]>(Object.values(MUSICFREE));
  const [selectedIndices, setSelectedIndices] = React.useState<boolean[]>([]);

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const onClick = async () => {
    showDialog();
  };

  const onSubmit = async (indices: boolean[]) => {
    const selectedMusicFreePlugin = [];
    for (const [i, v] of indices.entries()) {
      if (v) {
        selectedMusicFreePlugin.push(favLists[i]);
      }
    }
    setMusicFreePlugin(selectedMusicFreePlugin);
    hideDialog();
  };

  const init = async () => {
    const selectedMusicFreePlugin = await getMusicFreePlugin();
    const checks = Array(favLists.length)
      .fill(true)
      .map((_, index) => selectedMusicFreePlugin.includes(favLists[index]));
    setSelectedIndices(checks);
  };

  React.useEffect(() => {
    init();
  }, []);

  return (
    <>
      <SettingListItem
        icon={() => (
          <Image
            source={require("@assets/icons/musicfree.png")}
            style={style.musicFreeIcon}
          />
        )}
        settingName="MusicFree"
        onPress={onClick}
        settingCategory="PluginSettings"
      />
      <GenericCheckDialog
        visible={visible}
        title={String(t("PluginSettings.MusicFreeCheckTitle"))}
        options={favLists}
        onSubmit={onSubmit}
        onClose={() => hideDialog()}
        selectedIndices={selectedIndices}
      />
    </>
  );
};
const style = StyleSheet.create({
  musicFreeIcon: {
    width: 50,
    height: 50,
    marginLeft: 20,
    marginTop: 4,
  },
});
