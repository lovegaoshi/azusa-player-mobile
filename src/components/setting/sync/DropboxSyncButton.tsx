import React, { useState } from 'react';
import Snackbar from 'react-native-snackbar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { loginDropbox, noxBackup, noxRestore } from './DropboxAuth';
import { useNoxSetting } from 'hooks/useSetting';
import { logger } from '@utils/Logger';
import { exportPlayerContent, importPlayerContent } from '@utils/ChromeStorage';

const ImportSyncFavButton = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const initPlayer = useNoxSetting(state => state.initPlayer);

  const errorHandling = (e: Error, msg = t('Sync.DropboxDownloadFail')) => {
    logger.error(e);
    Snackbar.show({ text: msg });
    setLoading(false);
  };

  const cloudDownload = async () => {
    setLoading(true);
    const response = await noxRestore();
    if (response !== null) {
      const initializedStorage = await importPlayerContent(response);
      await initPlayer(initializedStorage);
      Snackbar.show({ text: t('Sync.DropboxDownloadSuccess') });
    } else {
      errorHandling(
        new Error(String(t('Sync.DropboxDownloadFail'))),
        String(t('Sync.DropboxDownloadFail'))
      );
    }
    setLoading(false);
    return response;
  };

  const loginAndDownload = async () => {
    setLoading(true);
    await loginDropbox(cloudDownload, errorHandling);
  };

  return loading ? (
    <ActivityIndicator size={60} style={styles.activityIndicator} />
  ) : (
    <IconButton
      icon="cloud-download"
      onPress={loginAndDownload}
      size={60}
      style={styles.iconButton}
    />
  );
};

const ExportSyncFavButton = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const errorHandling = (
    e: Error,
    msg = String(t('Sync.DropboxUploadFailSnackbar'))
  ) => {
    logger.error(e);
    Snackbar.show({ text: msg });
    setLoading(false);
  };

  const cloudUpload = async () => {
    setLoading(true);
    const exportedDict = await exportPlayerContent();
    const response = await noxBackup(exportedDict);
    if (response.status === 200) {
      Snackbar.show({ text: t('Sync.DropboxUploadSuccess') });
    } else {
      errorHandling(new Error(String(response.status)));
    }
    setLoading(false);
    return response;
  };

  const loginAndUpload = async () => {
    setLoading(true);
    await loginDropbox(cloudUpload, errorHandling);
  };

  return loading ? (
    <ActivityIndicator size={60} style={styles.activityIndicator} />
  ) : (
    <IconButton
      icon="cloud-upload"
      onPress={loginAndUpload}
      size={60}
      style={styles.iconButton}
    />
  );
};

export default () => {
  return (
    <View style={styles.container}>
      <ImportSyncFavButton />
      <View style={styles.spacing}></View>
      <ExportSyncFavButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIndicator: {},
  iconButton: {},
  spacing: {
    width: 20,
  },
});
