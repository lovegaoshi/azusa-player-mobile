import * as React from 'react';
import { View, Text, Switch, Pressable } from 'react-native';
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
      <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
        <View style={{ flex: 1, paddingTop: 10, paddingRight: 10 }}>
          <Switch value={playerSetting[settingName]} onValueChange={onToggle} />
        </View>
        <Pressable style={{ flex: 5 }} onPress={onToggle}>
          <Text style={{ fontSize: 20, color: 'black' }}>{name}</Text>
          <Text style={{ fontSize: 15, color: 'grey' }}>{desc}</Text>
        </Pressable>
      </View>
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
    </View>
  );
};
