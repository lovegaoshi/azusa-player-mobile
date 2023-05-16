import * as React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { TouchableRipple, Switch } from 'react-native-paper';
import { v4 as uuidv4 } from 'uuid';
import { useNoxSetting } from '../../hooks/useSetting';

interface SettingEntry {
  name: string;
  desc: string;
  settingName: string;
  reRender?: boolean;
  settingType?: string;
}
const GEN_SETTING_BOOLEAN: SettingEntry[] = [
  {name: 'Daily auto RSS update',
desc: "Automatically update playlist's subscriptions daily when opened.",
settingName: 'autoRSSUpdate',
  },
  {name: 'Parse song name',
desc: 'Show automatically parsed song names in playlist.',
settingName: 'parseSongName',
reRender: true
  },
  {name: 'Play searched results',
desc: 'When searching in a playlist, play the seached results.',
settingName: 'keepSearchedSongListWhenPlaying'
  },
  {name: 'Hide album cover',
desc: 'Hide the album cover.',
settingName: 'hideCoverInMobile'
  },
  {name: 'Data Saver',
desc: 'Render low quality assets to save data.',
settingName: 'dataSaver'
  },
  {name: 'Fast Bilibili Search',
desc: 'Do not search for bilibili video episodes.',
settingName: 'fastBiliSearch'
  },
]

export default () => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);
  const togglePlaylistShouldReRender = useNoxSetting(
    state => state.togglePlaylistShouldReRender
  );

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
  }

  const booleanSetting = ({
    name,
    desc,
    settingName,
    reRender = false
  }:SettingEntry) => {
    const onToggle = () => {
      saveSettings({ [settingName]: !playerSetting[settingName] });
      if (reRender) {
        togglePlaylistShouldReRender();
      }
    };

    return (
      <TouchableRipple onPress={onToggle} style={{ paddingHorizontal: 10 }} id={uuidv4()}>
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
        {GEN_SETTING_BOOLEAN.map(item => renderSetting(item))};
      </ScrollView>
    </View>
  );
};
