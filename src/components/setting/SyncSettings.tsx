import * as React from 'react';
import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNoxSetting } from '../../hooks/useSetting';
import { loginDropbox } from './sync/DropboxAuth';

export default () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  return (
    <View
      style={{
        backgroundColor: playerStyle.customColors.maskedBackgroundColor,
        flex: 1,
      }}
    >
      <Button onPress={() => loginDropbox().then(console.log)}>GAGAGA</Button>
    </View>
  );
};
