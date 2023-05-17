import * as React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { TouchableRipple, Switch } from 'react-native-paper';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { useNoxSetting } from '../../hooks/useSetting';

interface SettingEntry {
  name: string;
  desc: string;
  settingName: string;
  reRender?: boolean;
  settingType?: string;
}

export default () => {
  const { t } = useTranslation();
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);
  const togglePlaylistShouldReRender = useNoxSetting(
    state => state.togglePlaylistShouldReRender
  );

  const GEN_SETTING_BOOLEAN: SettingEntry[] = [
    {
      name: t('GeneralSettings.autoRSSUpdateName'),
      desc: t('GeneralSettings.autoRSSUpdateDesc'),
      settingName: 'autoRSSUpdate',
      },
      {
      name: t('GeneralSettings.parseSongNameName'),
      desc: t('GeneralSettings.parseSongNameDesc'),
      settingName: 'parseSongName',
      },
      {
      name: t('GeneralSettings.keepSearchedSongListWhenPlayingName'),
      desc: t('GeneralSettings.keepSearchedSongListWhenPlayingDesc'),
      settingName: 'keepSearchedSongListWhenPlaying',
      },
      {
      name: t('GeneralSettings.hideCoverInMobileName'),
      desc: t('GeneralSettings.hideCoverInMobileDesc'),
      settingName: 'hideCoverInMobile',
      },
      {
      name: t('GeneralSettings.dataSaverName'),
      desc: t('GeneralSettings.dataSaverDesc'),
      settingName: 'dataSaver',
      },
      {
      name: t('GeneralSettings.fastBiliSearchName'),
      desc: t('GeneralSettings.fastBiliSearchDesc'),
      settingName: 'fastBiliSearch',
      },
  ];

  const saveSettings = (toggled: { [key: string]: any }) => {
    setPlayerSetting({
      ...playerSetting,
      ...toggled,
    });
  };

  const renderSetting = (item: SettingEntry) => {
    switch (item.settingType) {
      default:
        return booleanSetting(item);
    }
  };

  const booleanSetting = ({
    name,
    desc,
    settingName,
    reRender = false,
  }: SettingEntry) => {
    const onToggle = () => {
      saveSettings({ [settingName]: !playerSetting[settingName] });
      if (reRender) {
        togglePlaylistShouldReRender();
      }
    };

    return (
      <TouchableRipple
        onPress={onToggle}
        style={{ paddingHorizontal: 10 }}
        key={uuidv4()}
      >
        <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
          <View style={{ flex: 5, paddingLeft: 5 }}>
            <Text style={{ fontSize: 20, color: playerStyle.colors.primary }}>
              {name}
            </Text>
            <Text style={{ fontSize: 15, color: playerStyle.colors.secondary }}>
              {desc}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              paddingTop: 10,
              alignItems: 'flex-end',
            }}
          >
            <Switch
              value={playerSetting[settingName]}
              onValueChange={onToggle}
            />
          </View>
        </View>
      </TouchableRipple>
    );
  };

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
