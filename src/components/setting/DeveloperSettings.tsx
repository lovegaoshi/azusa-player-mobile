import * as React from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { List } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line import/no-unresolved
import { APPSTORE } from '@env';
import { useStore } from 'zustand';
import * as Clipboard from 'expo-clipboard';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ParamListBase } from '@react-navigation/native';

import { useNoxSetting } from '@hooks/useSetting';
import { logStore, LOGLEVEL, getLog, resetLog } from '@utils/Logger';
import GenericSelectDialog from '../dialogs/GenericSelectDialog';
import { SettingListItem, RenderSetting } from './useRenderSetting';
import useVersionCheck from '@hooks/useVersionCheck';
import {
  SelectSettingEntry,
  SettingEntry,
  dummySelectSettingEntry,
} from './SetttingEntries';
import NoxCache from '@utils/Cache';
import useCleanCache from '@hooks/useCleanCache';
import appStore from '@stores/appStore';
import { saveFadeInterval } from '@utils/ChromeStorage';
import DummySettings from './DummySettings';
import GroupView from '../background/GroupView';

enum ICONS {
  setlog = 'console',
  update = 'update',
  showlog = 'bug',
  cache = 'floppy',
  clearcache = 'delete-sweep',
  clearOrphanCache = 'delete-empty',
  fade = 'shuffle-variant',
  plugins = 'puzzle',
}

enum VIEW {
  HOME = 'Settings',
  PLUGINS = 'Plugins',
}

const Stack = createNativeStackNavigator();

const FadeOptions = [0, 500, 1000, 1500];

const developerSettings: { [key: string]: SettingEntry } = {
  noInterruption: {
    settingName: 'noInterruption',
    settingCategory: 'DeveloperSettings',
    checkbox: true,
  },
  r128gain: {
    settingName: 'r128gain',
    settingCategory: 'GeneralSettings',
  },
  prefetchTrack: {
    settingName: 'prefetchTrack',
    settingCategory: 'GeneralSettings',
  },
  /**
  chatGPTSongName: {
    settingName: 'chatGPTResolveSongName',
    settingCategory: 'GeneralSettings',
  },
   */
};

const { getState, setState } = logStore;

interface Props {
  navigation: DrawerNavigationProp<ParamListBase>;
}
const Home = ({ navigation }: Props) => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);
  const { t } = useTranslation();
  const [currentSelectOption, setCurrentSelectOption] = React.useState<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SelectSettingEntry<any>
  >(dummySelectSettingEntry);
  const [selectVisible, setSelectVisible] = React.useState(false);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const { checkVersion } = useVersionCheck();
  const { orphanedCache, cleanOrphanedCache } = useCleanCache();
  const fadeIntervalMs = useStore(appStore, state => state.fadeIntervalMs);

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

  const selectFade = () => {
    setSelectVisible(true);
    setCurrentSelectOption({
      options: FadeOptions,
      renderOption: (option: number) => String(option),
      defaultIndex: 0,
      onClose: () => setSelectVisible(false),
      onSubmit: (index: number) => {
        saveFadeInterval(FadeOptions[index]);
        setSelectVisible(false);
      },
      title: t('DeveloperSettings.FadeTitle'),
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

  const showLog = () => {
    const logs = getLog();
    Alert.alert(
      'Log',
      logs,
      [
        { text: 'Clear', onPress: () => resetLog() },
        { text: 'Copy', onPress: () => Clipboard.setStringAsync(logs) },
        { text: 'OK', onPress: () => undefined },
      ],
      { cancelable: true }
    );
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
          <GroupView>
            <View>
              <RenderSetting item={developerSettings.noInterruption} />
              <RenderSetting item={developerSettings.prefetchTrack} />
            </View>
          </GroupView>
          <SettingListItem
            icon={ICONS.plugins}
            settingName="PluginsSetting"
            onPress={() => navigation.navigate(VIEW.PLUGINS)}
            settingCategory="Settings"
          />
          {!APPSTORE && (
            <SettingListItem
              icon={ICONS.update}
              settingName="VersionCheck"
              onPress={() => checkVersion(false)}
              settingCategory="DeveloperSettings"
            />
          )}
          <SettingListItem
            icon={ICONS.showlog}
            settingName="Log"
            onPress={showLog}
            settingCategory="DeveloperSettings"
          />
          <SettingListItem
            icon={ICONS.setlog}
            settingName="LogLevel"
            onPress={selectLogLevel}
            settingCategory="DeveloperSettings"
            modifyDescription={val =>
              `${val}: ${logLevelString[getState().logLevel]}`
            }
          />
          <SettingListItem
            icon={ICONS.fade}
            settingName="Fade"
            onPress={selectFade}
            settingCategory="DeveloperSettings"
            modifyDescription={val => `${val}: ${fadeIntervalMs}ms`}
          />
          <SettingListItem
            icon={ICONS.cache}
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
            icon={ICONS.clearcache}
            settingName="ClearCache"
            onPress={NoxCache.noxMediaCache.clearCache}
            settingCategory="DeveloperSettings"
            modifyDescription={() =>
              t('DeveloperSettings.ClearCacheDesc2', {
                val: NoxCache.noxMediaCache.cacheSize() || 0,
              })
            }
          />
          <SettingListItem
            icon={ICONS.clearOrphanCache}
            settingName="ClearOrphanedCache"
            onPress={cleanOrphanedCache}
            settingCategory="DeveloperSettings"
            modifyDescription={() =>
              t('DeveloperSettings.ClearOrphanedCacheDesc2', {
                val: orphanedCache.length,
              })
            }
          />
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

const DevSettingsView = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={VIEW.HOME}
        component={Home}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={VIEW.PLUGINS}
        component={DummySettings}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default DevSettingsView;
