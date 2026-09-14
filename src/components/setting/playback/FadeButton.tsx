import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';

import { SelectDialogChildren } from '../SelectDialogWrapper';
import { saveFadeInterval } from '@utils/ChromeStorage';
import { selfDestruct } from '@utils/RNUtils';
import { SelectSettingEntry } from '../helpers/SettingEntry';
import SettingListItem from '../helpers/SettingListItem';
import appStore from '@stores/appStore';

const FadeOptions = [0, 250, 500, 1000];
export default function FadeButton({
  setCurrentSelectOption,
  setSelectVisible,
}: SelectDialogChildren<any>) {
  const fadeIntervalMs = useStore(appStore, state => state.fadeIntervalMs);
  const { t } = useTranslation();

  const select = () => {
    setSelectVisible(true);
    setCurrentSelectOption({
      options: FadeOptions,
      renderOption: String,
      defaultIndex: 0,
      onClose: () => setSelectVisible(false),
      onSubmit: (index: number) => {
        saveFadeInterval(FadeOptions[index]).then(selfDestruct);
        setSelectVisible(false);
      },
      title: t('DeveloperSettings.FadeTitle'),
    } as SelectSettingEntry<number>);
  };

  return (
    <SettingListItem
      icon={'cosine-wave'}
      settingName="Fade"
      onPress={select}
      settingCategory="DeveloperSettings"
      modifyDescription={val => `${val}: ${fadeIntervalMs}ms`}
    />
  );
}
