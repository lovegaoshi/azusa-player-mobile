import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Appearance, ColorSchemeName } from 'react-native';

import SettingListItem from '../helpers/SettingListItem';
import { SelectSettingEntry } from '../helpers/SettingEntry';
import SelectDialogWrapper, {
  SelectDialogChildren,
} from '../SelectDialogWrapper';
import { saveColorScheme, getColorScheme } from '@utils/ChromeStorageAPI';

const ColorSchemei18n = (
  scheme: ColorSchemeName,
  t: (val: string) => string,
) => {
  switch (scheme) {
    case 'light':
      return t('AppearanceSettings.ColorSchemeLight');
    case 'dark':
      return t('AppearanceSettings.ColorSchemeDark');
    default:
      return t('AppearanceSettings.ColorSchemeAdaptive');
  }
};

const Button = ({
  setCurrentSelectOption,
  setSelectVisible,
}: SelectDialogChildren<any>) => {
  const { t } = useTranslation();

  const selectColorScheme = async () => {
    setSelectVisible(true);
    const options: ColorSchemeName[] = [null, 'light', 'dark'];
    const defaultIndex = options.indexOf((await getColorScheme()) || null);
    setCurrentSelectOption({
      options,
      renderOption: (option: ColorSchemeName) => ColorSchemei18n(option, t),
      defaultIndex: defaultIndex > -1 ? defaultIndex : 0,
      onClose: () => setSelectVisible(false),
      onSubmit: (index: number) => {
        setSelectVisible(false);
        Appearance.setColorScheme(options[index]);
        saveColorScheme(options[index]);
      },
      title: t('AppearanceSettings.ColorSchemeName'),
    } as SelectSettingEntry<ColorSchemeName>);
  };

  return (
    <SettingListItem
      settingName="ColorScheme"
      onPress={selectColorScheme}
      settingCategory="AppearanceSettings"
      modifyDescription={() =>
        t('AppearanceSettings.ColorSchemeDesc', {
          scheme: ColorSchemei18n(Appearance.getColorScheme(), t),
        })
      }
    />
  );
};

export default function SelectDarkModeButton() {
  return <SelectDialogWrapper Children={Button} />;
}
