import * as React from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { List } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

// eslint-disable-next-line import/no-unresolved
import { APPSTORE, LOCKHASH } from '@env';
import { logStore, LOGLEVEL } from '@utils/Logger';
import { RenderSetting } from '../helpers/RenderSetting';
import SettingListItem from '../helpers/SettingListItem';
import useVersionCheck from '@hooks/useVersionCheck';
import { SelectSettingEntry, SettingEntry } from '../helpers/SettingEntry';
import NoxCache from '@utils/Cache';
import useCleanCache from '@hooks/useCleanCache';
import GroupView from '../../background/GroupView';
import showLog from '../debug/Log';
import { showDebugLog } from '../debug/DebugConsole';
import {
  getTakanaDesc,
  disableTanaka,
  enableTanaka,
} from '@hooks/useTanakaAmazingCommodities';
import { isAndroid, selfDestruct } from '@utils/RNUtils';
import { SelectDialogChildren } from '../SelectDialogWrapper';
import { Route, Icons } from './enums';
import OTA from './OTA';
import PlayerSettingItems from './PlayerSettingItems';

const developerSettings: { [key: string]: SettingEntry } = {
  parseEmbeddedArtwork: {
    settingName: 'parseEmbeddedArtwork',
    settingCategory: 'GeneralSettings',
  },
  memoryEfficiency: {
    settingName: 'memoryEfficiency',
    settingCategory: 'GeneralSettings',
    callback: selfDestruct,
  },
  artworkCarousel: {
    settingName: 'artworkCarousel',
    settingCategory: 'GeneralSettings',
  },
  resumeOnPause: {
    settingName: 'resumeOnPause',
    settingCategory: 'GeneralSettings',
  },
  /**
  chatGPTSongName: {
    settingName: 'chatGPTResolveSongName',
    settingCategory: 'GeneralSettings',
  },
   */
};
const LogOptions = [
  LOGLEVEL.DEBUG,
  LOGLEVEL.INFO,
  LOGLEVEL.WARN,
  LOGLEVEL.ERROR,
  LOGLEVEL.CRITICAL,
  LOGLEVEL.NONE,
];

const { getState, setState } = logStore;

interface HomeProps
  extends NoxComponent.StackNavigationProps,
    SelectDialogChildren<any> {}

export const Home = ({
  navigation,
  setCurrentSelectOption,
  setSelectVisible,
}: HomeProps) => {
  const { t } = useTranslation();
  const { checkVersion } = useVersionCheck();
  const { orphanedCache, cleanOrphanedCache } = useCleanCache();

  // HACK: doesnt render on my phone?!
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
      options: LogOptions,
      renderOption: (option: number) => logLevelString[option],
      defaultIndex: getState().logLevel,
      onClose: () => setSelectVisible(false),
      onSubmit: (index: number) => {
        setState({ logLevel: index });
        setSelectVisible(false);
      },
      title: t('DeveloperSettings.LogLevelName'),
    } as SelectSettingEntry<number>);
  };

  return (
    <ScrollView>
      <List.Section>
        <GroupView>
          <View>
            {isAndroid && (
              <>
                <RenderSetting
                  item={developerSettings.parseEmbeddedArtwork}
                  delayedLoading={false}
                />
              </>
            )}
            {isAndroid && (
              <>
                <RenderSetting
                  item={developerSettings.resumeOnPause}
                  delayedLoading={false}
                />
              </>
            )}
            <RenderSetting
              item={developerSettings.artworkCarousel}
              delayedLoading={false}
            />
            <RenderSetting
              item={developerSettings.memoryEfficiency}
              delayedLoading={false}
            />
          </View>
        </GroupView>
        <SettingListItem
          icon={Icons.plugins}
          settingName="PluginsSetting"
          onPress={() => navigation.navigate(Route.PLUGINS)}
          settingCategory="Settings"
        />
        {!APPSTORE && (
          <SettingListItem
            icon={Icons.update}
            settingName="VersionCheck"
            onPress={() => checkVersion(false)}
            settingCategory="DeveloperSettings"
          />
        )}
        <SettingListItem
          icon={Icons.showlog}
          settingName="DebugLog"
          onPress={showDebugLog}
          settingCategory="DeveloperSettings"
        />
        <SettingListItem
          icon={Icons.showlog}
          settingName="Log"
          onPress={() => showLog()}
          settingCategory="DeveloperSettings"
        />
        <SettingListItem
          icon={Icons.setlog}
          settingName="LogLevel"
          onPress={selectLogLevel}
          settingCategory="DeveloperSettings"
          modifyDescription={val =>
            `${val}: ${logLevelString[getState().logLevel]}`
          }
        />
        <PlayerSettingItems
          setCurrentSelectOption={setCurrentSelectOption}
          setSelectVisible={setSelectVisible}
        />
        <SettingListItem
          icon={Icons.clearcache}
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
          icon={Icons.clearOrphanCache}
          settingName="ClearOrphanedCache"
          onPress={cleanOrphanedCache}
          settingCategory="DeveloperSettings"
          modifyDescription={() =>
            t('DeveloperSettings.ClearOrphanedCacheDesc2', {
              val: orphanedCache.length,
            })
          }
        />
        <SettingListItem
          icon={Icons.Tanaka}
          settingName="Tanaka"
          onPress={async () =>
            Alert.alert(
              t('DeveloperSettings.TanakaName'),
              await getTakanaDesc(),
              [
                { text: t('Dialog.nullify'), onPress: disableTanaka },
                { text: t('Dialog.ok'), onPress: enableTanaka },
              ],
              { cancelable: true },
            )
          }
          settingCategory="DeveloperSettings"
        />
        {LOCKHASH && <OTA />}
      </List.Section>
    </ScrollView>
  );
};
