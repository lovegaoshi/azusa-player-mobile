import * as React from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import { RenderSetting } from '../helpers/RenderSetting';
import SettingListItem from '../helpers/SettingListItem';
import SelectDarkModeButton from './SelectDarkModeButton';
import NoWeebButton from './NoWeebButton';
import SelectPhotoButton from './SelectPhotoButton';
import { SelectDialogChildren } from '../SelectDialogWrapper';
import useNoxSetting from '@stores/useApp';
import { SelectSettingEntry } from '../helpers/SettingEntry';

export enum VIEW {
  HOME = 'AppearanceHome',
  SKIN = 'SkinSetting',
}

// XS - S - M -L - XL - XXL - XXXL
const fontScaleOptions = [0.8, 0.9, 1, 1.1, 1.2, 1.4, 2];

interface HomeProps
  extends NoxComponent.StackNavigationProps,
    SelectDialogChildren<any> {}
export default ({
  navigation,
  setCurrentSelectOption,
  setSelectVisible,
}: HomeProps) => {
  const { t } = useTranslation();
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);
  const fontScaleString = fontScaleOptions.map((item, index) =>
    t(`AppearanceSettings.fontScale${index}`),
  );

  const selectFontScale = () => {
    setSelectVisible(true);
    setCurrentSelectOption({
      options: fontScaleOptions,
      renderOption: (_, index) => fontScaleString[index],
      defaultIndex: 2,
      onClose: () => setSelectVisible(false),
      onSubmit: (index: number) => {
        setPlayerSetting({ fontScale: fontScaleOptions[index] });
        setSelectVisible(false);
      },
      title: t('AppearanceSettings.fontScaleName'),
    } as SelectSettingEntry<number>);
  };

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
      <SettingListItem
        icon={'format-size'}
        settingName="fontScale"
        onPress={selectFontScale}
        settingCategory="AppearanceSettings"
      />
    </ScrollView>
  );
};
