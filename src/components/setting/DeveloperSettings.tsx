import * as React from 'react';
import { View, ScrollView } from 'react-native';
import { List } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { APPSTORE } from '@env';

import { useNoxSetting } from '../../hooks/useSetting';
import { logStore, LOGLEVEL } from '../../utils/Logger';
import GenericSelectDialog from '../dialogs/GenericSelectDialog';
import useRenderSettingItem from './useRenderSetting';
import useVersionCheck from '../../hooks/useVersionCheck';
import { getLog } from '../../utils/Logger';
import useAlert from '../dialogs/useAlert';
import {
  SelectSettingEntry,
  SettingEntry,
  dummySelectSettingEntry,
} from './SetttingEntries';
import NoxCache from '../../utils/Cache';
import useCleanCache from '../../hooks/useCleanCache';

enum ICONS {
  setlog = 'console',
  update = 'update',
  showlog = 'bug',
  cache = 'floppy',
  clearcache = 'delete-sweep',
  clearOrphanCache = 'delete-empty',
}

const developerSettings: { [key: string]: SettingEntry } = {
  noInterruption: {
    settingName: 'noInterruption',
    settingCategory: 'DeveloperSettings',
    checkbox: true,
  },
};

const { getState, setState } = logStore;

export default () => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);
  const { t } = useTranslation();
  const { OneWayAlert } = useAlert();
  const [currentSelectOption, setCurrentSelectOption] = React.useState<
    SelectSettingEntry<any>
  >(dummySelectSettingEntry);
  const [selectVisible, setSelectVisible] = React.useState(false);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const { renderListItem, renderSetting } = useRenderSettingItem();
  const { checkVersion } = useVersionCheck();
  const { orphanedCache, cleanOrphanedCache } = useCleanCache();

  const logLevelString = [
    t('DeveloperSettings.LogLevel0'),
    t('DeveloperSettings.LogLevel1'),
    t('DeveloperSettings.LogLevel2'),
    t('DeveloperSettings.LogLevel3'),
    t('DeveloperSettings.LogLevel4'),
    t('DeveloperSettings.LogLevel5'),
  ];

  const selectLogLevel = () => {
    setSelectVisible(true);
    setCurrentSelectOption({
      options: [
        LOGLEVEL.DEBUG,
        LOGLEVEL.INFO,
        LOGLEVEL.WARN,
        LOGLEVEL.ERROR,
        LOGLEVEL.CRITICAL,
        LOGLEVEL.NONE,
      ],
      renderOption: (option: number) => logLevelString[option],
      defaultIndex: getState().logLevel,
      onClose: () => setSelectVisible(false),
      onSubmit: (index: number) => {
        setState({ logLevel: index });
        setSelectVisible(false);
      },
      title: t('DeveloperSettings.LogLevel'),
    } as SelectSettingEntry<number>);
  };

  const selectCacheLevel = () => {
    setSelectVisible(true);
    const options = [
      0, // disabled
      100, // ~500 MB
      1000, // ~5 GB
      9999, // 50 GB
    ];
    const defaultIndex = options.indexOf(playerSetting.cacheSize);
    setCurrentSelectOption({
      options,
      defaultIndex: defaultIndex > -1 ? defaultIndex : 0,
      onClose: () => setSelectVisible(false),
      onSubmit: (index: number) => {
        setPlayerSetting({ cacheSize: options[index] });
        setSelectVisible(false);
      },
      title: t('DeveloperSettings.CacheSizeName'),
    } as SelectSettingEntry<number>);
  };

  return (
    <View
      style={{
        backgroundColor: playerStyle.customColors.maskedBackgroundColor,
        flex: 1,
      }}
    >
      <ScrollView>
        <List.Section>
          {renderSetting(developerSettings.noInterruption)}
          {renderListItem(
            ICONS.showlog,
            'Log',
            () => OneWayAlert('log', getLog()),
            'DeveloperSettings'
          )}
          {renderListItem(
            ICONS.setlog,
            'LogLevel',
            selectLogLevel,
            'DeveloperSettings',
            val => `${val}: ${logLevelString[getState().logLevel]}`
          )}
          {!APPSTORE &&
            renderListItem(
              ICONS.update,
              'VersionCheck',
              () => checkVersion(false),
              'DeveloperSettings'
            )}
          {renderListItem(
            ICONS.cache,
            'CacheSize',
            selectCacheLevel,
            'DeveloperSettings',
            () =>
              t('DeveloperSettings.CacheSizeDesc2', {
                val: playerSetting.cacheSize,
              })
          )}
          {renderListItem(
            ICONS.clearcache,
            'ClearCache',
            NoxCache.noxMediaCache.clearCache,
            'DeveloperSettings',
            () =>
              t('DeveloperSettings.ClearCacheDesc2', {
                val: NoxCache.noxMediaCache.cacheSize() || 0,
              })
          )}
          {renderListItem(
            ICONS.clearOrphanCache,
            'ClearOrphanedCache',
            cleanOrphanedCache,
            'DeveloperSettings',
            () =>
              t('DeveloperSettings.ClearCacheDesc2', {
                val: orphanedCache.length,
              })
          )}
        </List.Section>
      </ScrollView>
      <GenericSelectDialog
        visible={selectVisible}
        options={currentSelectOption.options}
        renderOptionTitle={currentSelectOption.renderOption}
        title={currentSelectOption.title}
        defaultIndex={currentSelectOption.defaultIndex}
        onClose={currentSelectOption.onClose}
        onSubmit={currentSelectOption.onSubmit}
      />
    </View>
  );
};
