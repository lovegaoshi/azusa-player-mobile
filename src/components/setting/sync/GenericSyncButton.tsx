/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { logger } from '@utils/Logger';
import { exportPlayerContent } from '@utils/ChromeStorageAPI';
import useSnack from '@stores/useSnack';
import keepAwake from '@utils/keepAwake';

const ImportSyncFavButton = ({
  restoreFromUint8Array,
  noxRestore,
  login,
}: NoxSyncComponent.ImportProps) => {
  const { t } = useTranslation();
  const setSnack = useSnack(state => state.setSnack);
  const [loading, setLoading] = useState(false);

  const errorHandling = (e: Error, msg = t('Sync.DropboxDownloadFail')) => {
    logger.error(e);
    setSnack({ snackMsg: { success: msg } });
    setLoading(false);
  };

  const cloudDownload = async () => {
    setLoading(true);
    const response = await noxRestore();
    if (response !== null) {
      await restoreFromUint8Array(response);
      setSnack({ snackMsg: { success: t('Sync.DropboxDownloadSuccess') } });
    } else {
      errorHandling(
        new Error(t('Sync.DropboxDownloadFail')),
        t('Sync.DropboxDownloadFail')
      );
    }
    setLoading(false);
    return response;
  };

  const loginAndDownload = () => {
    setLoading(true);
    keepAwake(() => login(cloudDownload, errorHandling));
  };

  return loading ? (
    <ActivityIndicator size={50} style={styles.activityIndicator} />
  ) : (
    <IconButton
      icon="cloud-download"
      onPress={loginAndDownload}
      size={50}
      style={styles.iconButton}
    />
  );
};

const ExportSyncFavButton = ({
  noxBackup,
  login,
}: NoxSyncComponent.ExportProps) => {
  const { t } = useTranslation();
  const setSnack = useSnack(state => state.setSnack);
  const [loading, setLoading] = useState(false);

  const errorHandling = (
    e: Error,
    msg = t('Sync.DropboxUploadFailSnackbar')
  ) => {
    logger.error(e);
    setSnack({ snackMsg: { success: msg } });
    setLoading(false);
  };

  const cloudUpload = async () => {
    setLoading(true);
    const exportedDict = await exportPlayerContent();
    const response = await noxBackup(exportedDict);
    if ([200, 201].includes(response.status)) {
      setSnack({ snackMsg: { success: t('Sync.DropboxUploadSuccess') } });
    } else {
      errorHandling(new Error(String(response.status)));
    }
    setLoading(false);
    return response;
  };

  const loginAndUpload = () => {
    setLoading(true);
    keepAwake(() => login(cloudUpload, errorHandling));
  };

  return loading ? (
    <ActivityIndicator size={50} style={styles.activityIndicator} />
  ) : (
    <IconButton
      icon="cloud-upload"
      onPress={loginAndUpload}
      size={50}
      style={styles.iconButton}
    />
  );
};

export default ({
  restoreFromUint8Array,
  login,
  noxBackup,
  noxRestore,
}: NoxSyncComponent.Props) => {
  return (
    <View style={styles.container}>
      <ImportSyncFavButton
        restoreFromUint8Array={restoreFromUint8Array}
        login={login}
        noxRestore={noxRestore}
      />
      <View style={styles.spacing}></View>
      <ExportSyncFavButton login={login} noxBackup={noxBackup} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIndicator: {
    width: 78,
    height: 78,
  },
  iconButton: {},
  spacing: {
    width: 20,
  },
});
