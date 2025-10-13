import { useTranslation } from 'react-i18next';

import { SelectDialogChildren } from '../SelectDialogWrapper';
import { useNoxSetting } from '@stores/useApp';
import { isAndroid, selfDestruct } from '@utils/RNUtils';
import { SelectSettingEntry } from '../helpers/SettingEntry';
import SettingListItem from '../helpers/SettingListItem';

const CrossFadeOptions = [0, 2500, 5000, 7500, 12000];
export default ({
  setCurrentSelectOption,
  setSelectVisible,
}: SelectDialogChildren<any>) => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);
  const { t } = useTranslation();

  const selectCrossFade = () => {
    setSelectVisible(true);
    setCurrentSelectOption({
      options: CrossFadeOptions,
      renderOption: String,
      defaultIndex: 0,
      onClose: () => setSelectVisible(false),
      onSubmit: (index: number) => {
        setPlayerSetting({ crossfade: CrossFadeOptions[index] / 1000 }).then(
          selfDestruct,
        );
        setSelectVisible(false);
      },
      title: t('DeveloperSettings.crossfadeTitle'),
    } as SelectSettingEntry<number>);
  };

  return isAndroid ? (
    <SettingListItem
      icon={'shuffle-variant'}
      settingName="crossfade"
      onPress={selectCrossFade}
      settingCategory="DeveloperSettings"
      modifyDescription={v => `${v}: ${playerSetting.crossfade * 1000}ms`}
    />
  ) : (
    <></>
  );
};
