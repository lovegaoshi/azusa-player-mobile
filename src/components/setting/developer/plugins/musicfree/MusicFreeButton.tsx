import * as React from 'react';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import SettingListItem from '@components/setting/helpers/SettingListItem';
import { Route } from '@components/setting/developer/enums';
import useNavigation from '@hooks/useNavigation';

const MusicFreeIcon = () => (
  <Image
    source={require('@assets/icons/musicfree.png')}
    style={style.musicFreeIcon}
  />
);

export default () => {
  const navigation = useNavigation();
  return (
    <SettingListItem
      icon={MusicFreeIcon}
      settingName="MusicFree"
      onPress={() => navigation.navigate2(Route.MUSICFREE)}
      settingCategory="PluginSettings"
    />
  );
};
const style = StyleSheet.create({
  musicFreeIcon: {
    width: 50,
    height: 50,
    marginLeft: 20,
    marginTop: 4,
  },
});
