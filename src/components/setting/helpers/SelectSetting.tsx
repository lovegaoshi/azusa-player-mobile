import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { useNoxSetting } from '@stores/useApp';
import { SelectSettingEntry, SettingEntry } from './SettingEntry';
import SettingListItem from './SettingListItem';

interface Props<T> {
  setSelectVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentSelectOption: React.Dispatch<
    React.SetStateAction<SelectSettingEntry<T>>
  >;
  options: T[];
  defaultIndex?: number;
  callback?: () => void;
  renderOption?: (i: T) => string;
  onClose?: () => void;
  settingKey: string;
  icon: string;
  settingCategory: string;
  modifyDescription?: (v: string) => string;
}

const SelectSetting = ({
  setSelectVisible,
  setCurrentSelectOption,
  options,
  renderOption,
  defaultIndex,
  onClose,
  callback,
  settingKey,
  icon,
  settingCategory,
  modifyDescription,
}: Props<any>) => {
  const { t } = useTranslation();
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);

  const onPress = () => {
    setSelectVisible(true);
    setCurrentSelectOption({
      options,
      renderOption: renderOption ?? (i => String(i)),
      defaultIndex: defaultIndex ?? options.indexOf(playerSetting[settingKey]),
      onClose: onClose ?? (() => setSelectVisible(false)),
      onSubmit: (index: number) => {
        setPlayerSetting({ [settingKey]: options[index] }).then(callback);
        setSelectVisible(false);
      },
      title: t(`${settingCategory}.${settingKey}Title`),
    } as SelectSettingEntry<unknown>);
  };

  return (
    <SettingListItem
      icon={icon}
      settingName={settingKey}
      onPress={onPress}
      settingCategory={settingCategory}
      modifyDescription={modifyDescription}
    />
  );
};

export default SelectSetting;
