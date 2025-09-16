import * as React from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { useNoxSetting } from '@stores/useApp';
import { RenderSetting } from './helpers/RenderSetting';
import { SettingEntry } from './helpers/SettingEntry';

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
    settingName: 'suggestedSkipLongVideo',
    settingCategory: 'GeneralSettings',
  },
  {
    settingName: 'screenAlwaysWake',
    settingCategory: 'GeneralSettings',
  },
  {
    settingName: 'karaokeLyrics',
    settingCategory: 'GeneralSettings',
  },
  {
    settingName: 'useSuggestion',
    settingCategory: 'GeneralSettings',
  },
  {
    settingName: 'noRepeat',
    settingCategory: 'GeneralSettings',
  },
  {
    settingName: 'preferYTMSuggest',
    settingCategory: 'GeneralSettings',
  },
  {
    settingName: 'smartShuffle',
    settingCategory: 'GeneralSettings',
  },
  {
    settingName: 'lyricTap',
    settingCategory: 'GeneralSettings',
  },
  {
    settingName: 'initYtbiOnStart',
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
        {GEN_SETTING_BOOLEAN.map(item => (
          <RenderSetting item={item} key={item.settingName} />
        ))}
      </ScrollView>
    </View>
  );
};
