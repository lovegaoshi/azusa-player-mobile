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

// XS - S - M -L - XL - XXL - XXXL
const fontScaleOptions = [0.8, 0.9, 1, 1.1, 1.2, 1.4, 2];

// Auto - M -L - XL - XXL
const lyricFontScaleOptions = [0, 1, 1.2, 1.5, 2];

// refactors anything depends on playerSetting out into its own component
export default function PlayerSettingItems({
  setCurrentSelectOption,
  setSelectVisible,
}: SelectDialogChildren<any>) {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);
  const { t } = useTranslation();
  const fontScaleString = fontScaleOptions.map((_, index) =>
    t(`AppearanceSettings.fontScale${index}`),
  );
  const lyricFontScaleString = fontScaleOptions.map((_, index) =>
    t(`AppearanceSettings.lyricFontScale${index}`),
  );

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

  const selectLyricFontScale = () => {
    setSelectVisible(true);
    setCurrentSelectOption({
      options: lyricFontScaleOptions,
      renderOption: (_, index) => lyricFontScaleString[index],
      defaultIndex: 0,
      onClose: () => setSelectVisible(false),
      onSubmit: (index: number) => {
        setPlayerSetting({ lyricFontScale: lyricFontScaleOptions[index] });
        setSelectVisible(false);
      },
      title: t('AppearanceSettings.lyricFontScaleName'),
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
      <SettingListItem
        icon={'format-size'}
        settingName="fontScale"
        onPress={selectFontScale}
        settingCategory="AppearanceSettings"
      />
      <SettingListItem
        icon={'format-size'}
        settingName="lyricFontScale"
        onPress={selectLyricFontScale}
        settingCategory="AppearanceSettings"
      />
    </>
  );
}
