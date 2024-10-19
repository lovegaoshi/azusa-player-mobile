import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@stores/useApp';
import GenericSelectDialog from '../dialogs/GenericSelectDialog';
import GenericCheckDialog from '../dialogs/GenericCheckDialog';
import { SyncOptions } from '@enums/Sync';
import PersonalSyncButton from './sync/PersonalSyncButton';
import DropboxSyncButton from './sync/DropboxAuth';
import GiteeSyncButton from './sync/GiteeAuth';
import GithubSyncButton from './sync/GithubAuth';
import useSync from './sync/useSync';

const EXPORT_OPTIONS_LIST = [
  // T
  // SyncOptions.LOCAL,
  SyncOptions.DROPBOX,
  SyncOptions.PERSONAL,
  SyncOptions.GITEE,
  SyncOptions.GITHUB,
];

interface SyncInterface {
  location: SyncOptions;
  restoreFromUint8Array: (data: Uint8Array) => Promise<void>;
}
const SyncButton = ({ location, restoreFromUint8Array }: SyncInterface) => {
  switch (location) {
    case SyncOptions.LOCAL:
      return <></>;
    case SyncOptions.DROPBOX:
      return (
        <DropboxSyncButton restoreFromUint8Array={restoreFromUint8Array} />
      );
    case SyncOptions.PERSONAL:
      return (
        <PersonalSyncButton restoreFromUint8Array={restoreFromUint8Array} />
      );
    case SyncOptions.GITEE:
      return <GiteeSyncButton restoreFromUint8Array={restoreFromUint8Array} />;
    case SyncOptions.GITHUB:
      return <GithubSyncButton restoreFromUint8Array={restoreFromUint8Array} />;
    default:
      return <></>;
  }
};

export default () => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);
  const [selectVisible, setSelectVisible] = React.useState(false);
  const {
    restoreFromUint8Array,
    syncPartialNoxExtension,
    syncCheckVisible,
    setSyncCheckVisible,
    noxExtensionContent,
  } = useSync();

  const renderOption = (option = playerSetting.settingExportLocation) => {
    switch (option) {
      case SyncOptions.LOCAL:
        return t('Sync.Local');
      case SyncOptions.DROPBOX:
        return t('Sync.Dropbox');
      case SyncOptions.PERSONAL:
        return t('Sync.PersonalCloud');
      case SyncOptions.GITEE:
        return t('Sync.Gitee');
      case SyncOptions.GITHUB:
        return t('Sync.Github');
      default:
        return 'ERROR';
    }
  };

  const [currentSelectOption] = React.useState({
    options: EXPORT_OPTIONS_LIST,
    renderOption,
    defaultIndex: EXPORT_OPTIONS_LIST.indexOf(
      playerSetting.settingExportLocation,
    ),
    onClose: () => setSelectVisible(false),
    onSubmit: (index: number) => {
      setPlayerSetting({ settingExportLocation: EXPORT_OPTIONS_LIST[index] });
      setSelectVisible(false);
    },
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: playerStyle.customColors.maskedBackgroundColor },
      ]}
    >
      <View style={styles.buttonContainer}>
        <Button
          style={styles.button}
          onPress={() => setSelectVisible(true)}
        >{`${t('Sync.ExportLocation')} ${renderOption()}`}</Button>
      </View>
      <SyncButton
        location={playerSetting.settingExportLocation}
        restoreFromUint8Array={restoreFromUint8Array}
      ></SyncButton>
      <GenericSelectDialog
        visible={selectVisible}
        options={currentSelectOption.options}
        title={t('Sync.ExportLocation')}
        renderOptionTitle={currentSelectOption.renderOption}
        defaultIndex={currentSelectOption.defaultIndex}
        onClose={currentSelectOption.onClose}
        onSubmit={currentSelectOption.onSubmit}
      />
      <GenericCheckDialog
        visible={syncCheckVisible}
        title={t('Sync.SyncCheck')}
        options={noxExtensionContent}
        onClose={() => setSyncCheckVisible(false)}
        onSubmit={syncPartialNoxExtension}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 10,
  },
});
