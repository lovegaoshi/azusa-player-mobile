import * as React from 'react';
import { View, Text, Switch, Pressable } from 'react-native';
import { TouchableRipple } from 'react-native-paper';
import { useNoxSetting } from '../../hooks/useSetting';

export default () => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
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

  const booleanSetting = (
    name: string,
    desc: string,
    settingName: string,
    reRender = false
  ) => {
    const onToggle = () => {
      saveSettings({ [settingName]: !playerSetting[settingName] });
      if (reRender) {
        togglePlaylistShouldReRender();
      }
    };

    return (
      <TouchableRipple onPress={onToggle} style={{ paddingHorizontal: 10 }}>
        <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
          <View style={{ flex: 5 }}>
            <Text style={{ fontSize: 20, color: 'black' }}>{name}</Text>
            <Text style={{ fontSize: 15, color: 'grey' }}>{desc}</Text>
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
    <View style={{}}>
      {booleanSetting(
        'Daily auto RSS update',
        "Automatically update playlist's subscriptions daily when opened.",
        'autoRSSUpdate'
      )}
      {booleanSetting(
        'Parse song name',
        'Show automatically parsed song names in playlist.',
        'parseSongName',
        true
      )}
      {booleanSetting(
        'Play searched results',
        'When searching in a playlist, play the seached results.',
        'keepSearchedSongListWhenPlaying'
      )}
      {booleanSetting(
        'Hide album cover',
        'Hide the album cover.',
        'hideCoverInMobile'
      )}
      {booleanSetting(
        'Data Saver',
        'Render low quality assets to save data.',
        'dataSaver'
      )}
      {booleanSetting(
        'Fast Bilibili Search',
        'Do not search for bilibili video episodes.',
        'fastBiliSearch'
      )}
    </View>
  );
};
