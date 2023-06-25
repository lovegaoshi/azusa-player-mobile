import React, { useState } from 'react';
import Snackbar from 'react-native-snackbar';
import { View, ActivityIndicator } from 'react-native';
import { IconButton } from 'react-native-paper';

import { loginDropbox, noxBackup, noxRestore } from './DropboxAuth';
import { useNoxSetting } from '../../../hooks/useSetting';
import { logger } from '../../../utils/Logger';
import {
  exportPlayerContent,
  importPlayerContent,
} from '../../../utils/ChromeStorage';

const ImportSyncFavButton = () => {
  const [loading, setLoading] = useState(false);
  const initPlayer = useNoxSetting(state => state.initPlayer);

  const errorHandling = (
    e: Error,
    msg = '歌单同步自私有云失败，错误记录在控制台里'
  ) => {
    logger.error(e);
    Snackbar.show({ text: msg });
    setLoading(false);
  };

  const cloudDownload = async () => {
    setLoading(true);
    const response = await noxRestore();
    if (response !== null) {
      // error handling is in importPlayerContent. failure in there resets player data
      // theoretically this is always safe
      const initializedStorage = await importPlayerContent(response);
      await initPlayer(initializedStorage);
      Snackbar.show({ text: '歌单同步自私有云成功！' });
    } else {
      errorHandling(new Error('云端歌单不存在'), '云端歌单不存在');
    }
    setLoading(false);
    return response;
  };

  const loginAndDownload = async () => {
    setLoading(true);
    await loginDropbox(cloudDownload, errorHandling);
  };

  return loading ? (
    <ActivityIndicator size={60} />
  ) : (
    <IconButton icon="cloud-download" onPress={loginAndDownload} size={60} />
  );
};

const ExportSyncFavButton = () => {
  const [loading, setLoading] = useState(false);

  const errorHandling = (
    e: Error,
    msg = '歌单上传到私有云失败，错误记录在控制台里'
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
      Snackbar.show({ text: '歌单上传到私有云成功！' });
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
    <ActivityIndicator size={60} />
  ) : (
    <IconButton icon="cloud-upload" onPress={loginAndUpload} size={60} />
  );
};

export default () => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
      }}
    >
      <ImportSyncFavButton />
      <View style={{ width: 20 }}></View>
      <ExportSyncFavButton />
    </View>
  );
};
