import React from 'react';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@stores/useApp';
import { SelectSettingEntry } from './SettingEntry';
import SettingListItem from './SettingListItem';

interface SelectProps<T> extends Props<T> {
  defaultIndex?: number;
}

interface Props<T> {
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentOption: React.Dispatch<
    React.SetStateAction<SelectSettingEntry<T> | undefined>
  >;
  options: T[];
  callback?: () => void;
  renderOption?: (i: T) => string;
  onClose?: () => void;
  settingKey: string;
  icon: string;
  settingCategory: string;
  modifyDescription?: (v: string) => string;
}

const SelectSetting = ({
  setVisible,
  setCurrentOption,
  options,
  renderOption,
  defaultIndex,
  onClose,
  callback,
  settingKey,
  icon,
  settingCategory,
  modifyDescription,
}: SelectProps<any>) => {
  const { t } = useTranslation();
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);

  const onPress = () => {
    setVisible(true);
    setCurrentOption({
      options,
      renderOption: renderOption ?? (i => String(i)),
      defaultIndex: defaultIndex ?? options.indexOf(playerSetting[settingKey]),
      onClose: onClose ?? (() => setVisible(false)),
      onSubmit: (index: number) => {
        setPlayerSetting({ [settingKey]: options[index] }).then(callback);
        setVisible(false);
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
