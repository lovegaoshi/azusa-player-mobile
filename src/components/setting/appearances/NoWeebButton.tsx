import React from 'react';
import { StyleSheet, View } from 'react-native';

import { SettingListItem } from '../useRenderSetting';
import NoWeebDialog from './NoWeebDialog';

export default () => {
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
};
