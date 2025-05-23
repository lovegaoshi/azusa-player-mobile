import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@stores/useApp';
import SettingListItem from '../helpers/SettingListItem';
import { SelectSettingEntry } from '../helpers/SettingEntry';
import { selfDestruct } from '@utils/RNUtils';
import SelectSetting from '../helpers/SelectSetting';
import { SelectDialogChildren } from '../SelectDialogWrapper';
import { Icons } from './enums';

const ArtworkResOptions = [0, 240, 360, 480, 720, 1080];

// refactors anything depends on playerSetting out into its own component
export default ({
  setCurrentSelectOption,
  setSelectVisible,
}: SelectDialogChildren<any>) => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);
  const { t } = useTranslation();
  const selectCacheLevel = () => {
    setSelectVisible(true);
    const options = [
      0, // disabled
      100, // ~500 MB
      200,
      1000, // ~5 GB
      9999, // 50 GB
    ];
    const defaultIndex = options.indexOf(playerSetting.cacheSize);
    setCurrentSelectOption({
      options,
      defaultIndex: defaultIndex > -1 ? defaultIndex : 0,
      onClose: () => setSelectVisible(false),
      onSubmit: (index: number) => {
        setPlayerSetting({ cacheSize: options[index] }).then(selfDestruct);
        setSelectVisible(false);
      },
      title: t('DeveloperSettings.CacheSizeName'),
    } as SelectSettingEntry<number>);
  };

  return (
    <>
      <SelectSetting
        setVisible={setSelectVisible}
        setCurrentOption={setCurrentSelectOption}
        options={ArtworkResOptions}
        renderOption={(option: number) => `${option}p`}
        settingKey="artworkRes"
        icon={Icons.ArtworkRes}
        settingCategory="DeveloperSettings"
        modifyDescription={v => `${v}: ${playerSetting.artworkRes}p`}
      />
      <SettingListItem
        icon={Icons.cache}
        settingName="CacheSize"
        onPress={selectCacheLevel}
        settingCategory="DeveloperSettings"
        modifyDescription={() =>
          t('DeveloperSettings.CacheSizeDesc2', {
            val: playerSetting.cacheSize,
          })
        }
      />
    </>
  );
};
