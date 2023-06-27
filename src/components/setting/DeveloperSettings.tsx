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
import { SelectSettingEntry, SettingEntry, dummySelectSettingEntry } from './SetttingEntries';

enum ICONS {
  setlog = 'console',
  update = 'update',
  showlog = 'bug',
  cache = 'floppy',
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
      renderOption: (option: number) =>
        logLevelString[option],
      defaultIndex: getState().logLevel,
      onClose: () => setSelectVisible(false),
      onSubmit: (index: number) => {
        setState({ logLevel: index });
        setSelectVisible(false);
      },
    } as SelectSettingEntry<number>);
  };

  const selectCacheLevel = () => {
    setSelectVisible(true);
    const options = [
      0, // disabled
      100, // ~500 MB
      1000, // ~5 GB
      9999 // 50 GB
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
            (val) => `${val}: ${logLevelString[getState().logLevel]}`
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
            (val) => `max ${playerSetting.cacheSize} songs cached`
          )}
        </List.Section>
      </ScrollView>
      <GenericSelectDialog
        visible={selectVisible}
        options={currentSelectOption.options}
        renderOptionTitle={currentSelectOption.renderOption}
        title={String(t('DeveloperSettings.LogLevelName'))}
        defaultIndex={currentSelectOption.defaultIndex}
        onClose={currentSelectOption.onClose}
        onSubmit={currentSelectOption.onSubmit}
      />
    </View>
  );
};
