import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Appearance, View, ColorSchemeName } from 'react-native';

import { SettingListItem } from '../useRenderSetting';
import GenericSelectDialog from '@components/dialogs/GenericSelectDialog';
import {
  SelectSettingEntry,
  dummySelectSettingEntry,
} from '../SetttingEntries';
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

export default () => {
  const { t } = useTranslation();
  const [currentSelectOption, setCurrentSelectOption] = React.useState<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SelectSettingEntry<any>
  >(dummySelectSettingEntry);
  const [selectVisible, setSelectVisible] = React.useState(false);

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
    <View>
      <GenericSelectDialog
        visible={selectVisible}
        options={currentSelectOption.options}
        renderOptionTitle={currentSelectOption.renderOption}
        title={currentSelectOption.title}
        defaultIndex={currentSelectOption.defaultIndex}
        onClose={currentSelectOption.onClose}
        onSubmit={currentSelectOption.onSubmit}
      />
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
    </View>
  );
};
