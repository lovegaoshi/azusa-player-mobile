import React from 'react';
import { View } from 'react-native';

import SettingListItem from '../helpers/SettingListItem';
import NoWeebDialog from './NoWeebDialog';

export default function NoWeebButton() {
  const [visible, setVisible] = React.useState(false);

  return (
    <View>
      <NoWeebDialog visible={visible} setVisible={setVisible} />
      <SettingListItem
        settingName="noWeebSkins"
        onPress={() => setVisible(true)}
        settingCategory="AppearanceSettings"
      />
    </View>
  );
}
