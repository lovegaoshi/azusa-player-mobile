import * as React from 'react';
import { View, Text, Switch } from 'react-native';
import { useNoxSetting } from '../../hooks/useSetting';

export default () => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);

  const saveSettings = (toggled: { [key: string]: any }) => {
    setPlayerSetting({
      ...playerSetting,
      ...toggled,
    });
  };

  const booleanSetting = (name: string, desc: string, settingName: string) => {
    return (
      <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
        <View style={{ flex: 1, paddingTop: 10, paddingRight: 10 }}>
          <Switch
            value={playerSetting[settingName]}
            onValueChange={() =>
              saveSettings({ [settingName]: !playerSetting[settingName] })
            }
          />
        </View>
        <View style={{ flex: 5 }}>
          <Text style={{ fontSize: 20, color: 'black' }}>{name}</Text>
          <Text style={{ fontSize: 15, color: 'grey' }}>{desc}</Text>
        </View>
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
        'parseSongName'
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
