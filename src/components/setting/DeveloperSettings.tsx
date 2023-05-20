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

  const selectSetting = () => {
    return;
  };

  return (
    <View
      style={{
        backgroundColor: playerStyle.customColors.maskedBackgroundColor,
        flex: 1,
      }}
    >
      <ScrollView></ScrollView>
    </View>
  );
};
