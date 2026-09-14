import { useTranslation } from 'react-i18next';

import { SelectDialogChildren } from '../SelectDialogWrapper';
import { useNoxSetting } from '@stores/useApp';
import { isAndroid } from '@utils/RNUtils';
import { SelectSettingEntry } from '../helpers/SettingEntry';
import SettingListItem from '../helpers/SettingListItem';

const CropArtworkOptions: [0, 1, 2] = [0, 1, 2];
export default function CropArtworkButton({
  setCurrentSelectOption,
  setSelectVisible,
}: SelectDialogChildren<any>) {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);
  const { t } = useTranslation();

  const select = () => {
    setSelectVisible(true);
    setCurrentSelectOption({
      options: CropArtworkOptions,
      renderOption: option => t(`AppearanceSettings.cropArtwork${option}`),
      defaultIndex: CropArtworkOptions.indexOf(playerSetting.cropArtwork),
      onClose: () => setSelectVisible(false),
      onSubmit: (index: number) => {
        setPlayerSetting({ cropArtwork: CropArtworkOptions[index] });
        setSelectVisible(false);
      },
      title: t('AppearanceSettings.cropArtworkTitle'),
    } as SelectSettingEntry<number>);
  };

  return (
    isAndroid && (
      <SettingListItem
        icon={'crop'}
        settingName="cropArtwork"
        onPress={select}
        settingCategory="AppearanceSettings"
      />
    )
  );
}
