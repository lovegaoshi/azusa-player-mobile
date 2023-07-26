import * as React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNoxSetting } from 'hooks/useSetting';
import { renderSetting } from './useRenderSetting';
import { SettingEntry } from './SetttingEntries';

const GEN_SETTING_BOOLEAN: SettingEntry[] = [
  {
    settingName: 'autoRSSUpdate',
    settingCategory: 'GeneralSettings',
  },
  {
    settingName: 'parseSongName',
    settingCategory: 'GeneralSettings',
  },
  {
    settingName: 'keepSearchedSongListWhenPlaying',
    settingCategory: 'GeneralSettings',
  },
  {
    settingName: 'hideCoverInMobile',
    settingCategory: 'GeneralSettings',
  },
  /*
  {
    settingName: 'dataSaver',
    settingCategory: 'GeneralSettings',
  },
  */
  {
    settingName: 'fastBiliSearch',
    settingCategory: 'GeneralSettings',
  },
  {
    settingName: 'noCookieBiliSearch',
    settingCategory: 'GeneralSettings',
  },
];

export default () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <View
      style={{
        backgroundColor: playerStyle.customColors.maskedBackgroundColor,
        flex: 1,
      }}
    >
      <ScrollView>
        {GEN_SETTING_BOOLEAN.map(item => renderSetting(item))}
      </ScrollView>
    </View>
  );
};
