import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@stores/useApp';
import { RenderSetting, SettingListItem } from './useRenderSetting';
import { SettingEntry } from './SetttingEntries';
import {
  chooseLocalMediaFolderAndroid,
  FilePickerResult,
} from '@utils/RNUtils';

const BooleanSettings: SettingEntry[] = [
  {
    settingName: 'downloadToMp3',
    settingCategory: 'DownloadSettings',
  },
  {
    settingName: 'downloadID3V2',
    settingCategory: 'DownloadSettings',
  },
  {
    settingName: 'downloadEmbedAlbumCover',
    settingCategory: 'DownloadSettings',
  },
];

export default () => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);

  const chooseDownloadFolder = async () => {
    const result = await chooseLocalMediaFolderAndroid();
    setPlayerSetting({
      downloadLocation:
        result.reason === FilePickerResult.Success
          ? result.relativePath
          : undefined,
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
        icon={'file-download'}
        settingName="DownloadLocation"
        onPress={chooseDownloadFolder}
        settingCategory="DownloadSettings"
        modifyDescription={() =>
          playerSetting.downloadLocation ?? t('DownloadSettings.Off')
        }
      />
      {BooleanSettings.map(item => (
        <RenderSetting item={item} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  dummySettingsContainer: {
    flex: 1,
  },
  dummySettingsText: {
    fontSize: 60,
    paddingLeft: 20,
  },
});
