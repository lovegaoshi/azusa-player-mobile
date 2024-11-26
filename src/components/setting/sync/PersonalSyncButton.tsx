// TODO: migrate to GenericSyncButton
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  ActivityIndicator,
  IconButton,
  Text,
  TextInput,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { noxBackup, noxRestore } from './PersonalCloudAuth';
import { useNoxSetting } from '@stores/useApp';
import { logger } from '@utils/Logger';
import { exportPlayerContent } from '@utils/ChromeStorageAPI';
import useSnack from '@stores/useSnack';

interface Props {
  cloudAddress: string;
  cloudID?: string;
  restoreFromUint8Array: (data: Uint8Array) => Promise<void>;
}

interface MainProps {
  restoreFromUint8Array: (data: Uint8Array) => Promise<void>;
}

const ImportSyncFavButton = ({
  cloudAddress,
  cloudID,
  restoreFromUint8Array,
}: Props) => {
  const { t } = useTranslation();
  const setSnack = useSnack(state => state.setSnack);
  const [loading, setLoading] = useState(false);

  const errorHandling = (
    e: Error,
    msg = t('Sync.PersonalCloudDownloadFail'),
  ) => {
    logger.error(e);
    setSnack({ snackMsg: { success: msg } });
    setLoading(false);
  };

  const cloudDownload = async () => {
    setLoading(true);
    const response = await noxRestore(cloudAddress, cloudID);
    if (response !== null) {
      // error handling is in importPlayerContent. failure in there resets player data
      // theoretically this is always safe
      await restoreFromUint8Array(response);
      setSnack({
        snackMsg: { success: t('Sync.PersonalCloudDownloadSuccess') },
      });
    } else {
      errorHandling(
        new Error(t('Sync.PersonalCloudDownloadFail')),
        t('Sync.PersonalCloudDownloadFail'),
      );
    }
    setLoading(false);
    return response;
  };

  return loading ? (
    <ActivityIndicator size={50} style={styles.activityIndicator} />
  ) : (
    <IconButton icon="cloud-download" onPress={cloudDownload} size={50} />
  );
};

const ExportSyncFavButton = ({ cloudAddress, cloudID }: Props) => {
  const { t } = useTranslation();
  const setSnack = useSnack(state => state.setSnack);
  const [loading, setLoading] = useState(false);

  const errorHandling = (
    e: Error,
    msg = t('Sync.PersonalCloudUploadFailSnackbar'),
  ) => {
    logger.error(e);
    setSnack({ snackMsg: { success: msg } });
    setLoading(false);
  };

  const cloudUpload = async () => {
    setLoading(true);
    const exportedDict = await exportPlayerContent();
    const response = await noxBackup(exportedDict, cloudAddress, cloudID);
    if (response.status === 200) {
      setSnack({ snackMsg: { success: t('Sync.PersonalCloudUploadSuccess') } });
    } else {
      errorHandling(new Error(String(response.status)));
    }
    setLoading(false);
    return response;
  };

  return loading ? (
    <ActivityIndicator size={50} style={styles.activityIndicator} />
  ) : (
    <IconButton icon="cloud-upload" onPress={cloudUpload} size={50} />
  );
};

interface TextProps {
  settingKey: string;
  label: string;
  placeholder: string;
}

const SetTextField = ({ settingKey, label, placeholder }: TextProps) => {
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
      onEndEditing={e => saveVal(e.nativeEvent.text)}
    />
  );
};

export default ({ restoreFromUint8Array }: MainProps) => {
  const { t } = useTranslation();
  const playerSetting = useNoxSetting(state => state.playerSetting);

  const personalCloudIPTextField: TextProps = {
    settingKey: 'personalCloudIP',
    label: t('Sync.personalCloudIPLabel'),
    placeholder: t('Sync.personalCloudIPPlaceholder'),
  };

  const personalCloudIDTextField: TextProps = {
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
          restoreFromUint8Array={restoreFromUint8Array}
        />
        <View style={styles.emptyPlaceholder}></View>
        <ExportSyncFavButton
          cloudAddress={playerSetting.personalCloudIP}
          cloudID={playerSetting.personalCloudID}
          restoreFromUint8Array={restoreFromUint8Array}
        />
      </View>
      <View style={styles.keySuggestion}>
        <Text>{t('Sync.PersonalCloudKeySuggestion')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  keySuggestion: {
    paddingHorizontal: 10,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  emptyPlaceholder: { width: 20 },
  activityIndicator: {
    width: 78,
    height: 78,
  },
});
