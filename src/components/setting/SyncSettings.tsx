import * as React from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useNoxSetting } from '../../hooks/useSetting';
import GenericSelectDialog from '../dialogs/GenericSelectDialog';
import { EXPORT_OPTIONS } from '../../enums/Sync';
import PersonalSyncButton from './sync/PersonalSyncButton';
import DropboxSyncButton from './sync/DropboxSyncButton';

const EXPORT_OPTIONS_LIST = [
  // T
  // EXPORT_OPTIONS.LOCAL,
  EXPORT_OPTIONS.DROPBOX,
  EXPORT_OPTIONS.PERSONAL,
];

const SyncButton = ({ location }: { location: EXPORT_OPTIONS }) => {
  switch (location) {
    case EXPORT_OPTIONS.LOCAL:
      return <></>;
    case EXPORT_OPTIONS.DROPBOX:
      return <DropboxSyncButton />;
    case EXPORT_OPTIONS.PERSONAL:
      return <PersonalSyncButton />;
    default:
      return <></>;
  }
};

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export default ({ navigation }: Props) => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);
  const [selectVisible, setSelectVisible] = React.useState(false);

  const renderOption = (option = playerSetting.settingExportLocation) => {
    switch (option) {
      case EXPORT_OPTIONS.LOCAL:
        return t('Sync.Local');
      case EXPORT_OPTIONS.DROPBOX:
        return t('Sync.Dropbox');
      case EXPORT_OPTIONS.PERSONAL:
        return t('Sync.PersonalCloud');
      default:
        return 'ERROR';
    }
  };

  const [currentSelectOption] = React.useState({
    options: EXPORT_OPTIONS_LIST,
    renderOption,
    defaultIndex: EXPORT_OPTIONS_LIST.indexOf(
      playerSetting.settingExportLocation
    ),
    onClose: () => setSelectVisible(false),
    onSubmit: (index: number) => {
      setPlayerSetting({ settingExportLocation: EXPORT_OPTIONS_LIST[index] });
      setSelectVisible(false);
    },
  });

  return (
    <View
      style={{
        backgroundColor: playerStyle.customColors.maskedBackgroundColor,
        flex: 1,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <Button
          style={{ paddingVertical: 10 }}
          onPress={() => setSelectVisible(true)}
        >{`${t('Sync.ExportLocation')} ${renderOption()}`}</Button>
      </View>
      <SyncButton location={playerSetting.settingExportLocation}></SyncButton>
      <GenericSelectDialog
        visible={selectVisible}
        options={currentSelectOption.options}
        title={String(t('Sync.ExportLocation'))}
        renderOptionTitle={currentSelectOption.renderOption}
        defaultIndex={currentSelectOption.defaultIndex}
        onClose={currentSelectOption.onClose}
        onSubmit={currentSelectOption.onSubmit}
      />
    </View>
  );
};
