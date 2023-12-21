import * as React from 'react';
import { View, ScrollView } from 'react-native';
import { useNoxSetting } from '@stores/useApp';
import { RenderSetting } from './useRenderSetting';
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
    settingName: 'noCookieBiliSearch',
    settingCategory: 'GeneralSettings',
  },
  {
    settingName: 'dataSaver',
    settingCategory: 'GeneralSettings',
  },
  {
    settingName: 'fastBiliSearch',
    settingCategory: 'GeneralSettings',
  },
  {
    settingName: 'updateLoadedTrack',
    settingCategory: 'GeneralSettings',
  },
  {
    settingName: 'r128gain',
    settingCategory: 'GeneralSettings',
  },
  {
    settingName: 'suggestedSkipLongVideo',
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
        {GEN_SETTING_BOOLEAN.map(item => RenderSetting({ item }))}
      </ScrollView>
    </View>
  );
};
