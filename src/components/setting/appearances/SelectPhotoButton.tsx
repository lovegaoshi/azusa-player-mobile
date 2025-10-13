import React from 'react';
import * as ImagePicker from 'expo-image-picker';

import SettingListItem from '../helpers/SettingListItem';
import { useNoxSetting } from '@stores/useApp';

export default function SelectPhotoButton() {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const setPlayerStyle = useNoxSetting(state => state.setPlayerStyle);

  const setPlayerStyleBackground = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setPlayerStyle({
        ...playerStyle,
        backgroundImages: [uri],
        bkgrdImg: uri,
      });
    }
  };

  return (
    <SettingListItem
      settingName="selectPhoto"
      onPress={setPlayerStyleBackground}
      settingCategory="AppearanceSettings"
    />
  );
}
