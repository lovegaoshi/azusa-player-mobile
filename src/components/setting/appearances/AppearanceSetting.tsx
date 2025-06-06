import * as React from 'react';
import { ScrollView } from 'react-native';

import { RenderSetting } from '../helpers/RenderSetting';
import SettingListItem from '../helpers/SettingListItem';
import SelectDarkModeButton from './SelectDarkModeButton';
import NoWeebButton from './NoWeebButton';
import SelectPhotoButton from './SelectPhotoButton';

export enum VIEW {
  HOME = 'AppearanceHome',
  SKIN = 'SkinSetting',
}

export default ({ navigation }: NoxComponent.StackNavigationProps) => {
  return (
    <ScrollView>
      <SettingListItem
        icon={'palette-swatch-variant'}
        settingName="SkinSetting"
        onPress={() => navigation.navigate(VIEW.SKIN)}
        settingCategory="Settings"
      />
      <RenderSetting
        item={{
          settingName: 'hideCoverInMobile',
          settingCategory: 'AppearanceSettings',
        }}
      />
      <RenderSetting
        item={{
          settingName: 'trackCoverArtCard',
          settingCategory: 'AppearanceSettings',
        }}
      />
      <RenderSetting
        item={{
          settingName: 'wavyProgressBar',
          settingCategory: 'AppearanceSettings',
        }}
      />
      <RenderSetting
        item={{
          settingName: 'accentColor',
          settingCategory: 'AppearanceSettings',
        }}
      />
      <SelectDarkModeButton />
      <NoWeebButton />
      <SelectPhotoButton />
      <RenderSetting
        item={{
          settingName: 'alwaysShowBottomTab',
          settingCategory: 'AppearanceSettings',
        }}
      />
    </ScrollView>
  );
};
