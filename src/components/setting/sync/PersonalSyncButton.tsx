import React, { useState } from 'react';
import Snackbar from 'react-native-snackbar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { IconButton, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { noxBackup, noxRestore } from './PersonalCloudAuth';
import { useNoxSetting } from '../../../hooks/useSetting';
import { logger } from '../../../utils/Logger';
import {
  exportPlayerContent,
  importPlayerContent,
} from '../../../utils/ChromeStorage';

interface Props {
  cloudAddress: string;
  cloudID?: string;
}

const ImportSyncFavButton = ({ cloudAddress, cloudID }: Props) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const initPlayer = useNoxSetting(state => state.initPlayer);

  const errorHandling = (
    e: Error,
    msg = t('Sync.PersonalCloudDownloadFail')
  ) => {
    logger.error(e);
    Snackbar.show({ text: msg });
    setLoading(false);
  };

  const cloudDownload = async () => {
    setLoading(true);
    const response = await noxRestore(cloudAddress, cloudID);
    if (response !== null) {
      // error handling is in importPlayerContent. failure in there resets player data
      // theoretically this is always safe
      const initializedStorage = await importPlayerContent(response);
      await initPlayer(initializedStorage);
      Snackbar.show({ text: t('Sync.PersonalCloudDownloadSuccess') });
    } else {
      errorHandling(
        new Error(String(t('Sync.PersonalCloudDownloadFail'))),
        String(t('Sync.PersonalCloudDownloadFail'))
      );
    }
    setLoading(false);
    return response;
  };

  return loading ? (
    <ActivityIndicator size={60} />
  ) : (
    <IconButton icon="cloud-download" onPress={cloudDownload} size={60} />
  );
};

const ExportSyncFavButton = ({ cloudAddress, cloudID }: Props) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const errorHandling = (
    e: Error,
    msg = String(t('Sync.PersonalCloudUploadFailSnackbar'))
  ) => {
    logger.error(e);
    Snackbar.show({ text: msg });
    setLoading(false);
  };

  const cloudUpload = async () => {
    setLoading(true);
    const exportedDict = await exportPlayerContent();
    const response = await noxBackup(exportedDict, cloudAddress, cloudID);
    if (response.status === 200) {
      Snackbar.show({ text: t('Sync.PersonalCloudUploadSuccess') });
    } else {
      errorHandling(new Error(String(response.status)));
    }
    setLoading(false);
    return response;
  };

  return loading ? (
    <ActivityIndicator size={60} />
  ) : (
    <IconButton icon="cloud-upload" onPress={cloudUpload} size={60} />
  );
};

interface textProps {
  settingKey: string;
  label: string;
  placeholder: string;
}

const SetTextField = ({ settingKey, label, placeholder }: textProps) => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);
  const saveVal = (val: string) => setPlayerSetting({ [settingKey]: val });

  return (
    <TextInput
      label={label}
      defaultValue={playerSetting[settingKey]}
      placeholder={placeholder}
      selectTextOnFocus
      selectionColor={playerStyle.customColors.textInputSelectionColor}
      textColor={playerStyle.colors.text}
      onEndEditing={e => saveVal(e.nativeEvent.text)}
    />
  );
};

export default () => {
  const { t } = useTranslation();
  const playerSetting = useNoxSetting(state => state.playerSetting);

  const personalCloudIPTextField: textProps = {
    settingKey: 'personalCloudIP',
    label: t('Sync.personalCloudIPLabel'),
    placeholder: t('Sync.personalCloudIPPlaceholder'),
  };

  const personalCloudIDTextField: textProps = {
    settingKey: 'personalCloudID',
    label: t('Sync.personalCloudKeyLabel'),
    placeholder: t('Sync.personalCloudKeyPlaceholder'),
  };

  return (
    <View>
      <SetTextField {...personalCloudIPTextField} />
      <SetTextField {...personalCloudIDTextField} />
      <View style={styles.container}>
        <ImportSyncFavButton
          cloudAddress={playerSetting.personalCloudIP}
          cloudID={playerSetting.personalCloudID}
        />
        <View style={styles.emptyPlaceholder}></View>
        <ExportSyncFavButton
          cloudAddress={playerSetting.personalCloudIP}
          cloudID={playerSetting.personalCloudID}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  emptyPlaceholder: { width: 20 },
});
