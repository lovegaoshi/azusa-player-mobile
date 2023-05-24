import React, { useContext, useState } from 'react';
import Snackbar from 'react-native-snackbar';
import { View } from 'react-native';
import { IconButton, TextInput } from 'react-native-paper';

import { noxBackup, noxRestore } from './PersonalCloudAuth';
import { useNoxSetting } from '../../../hooks/useSetting';
import { logger } from '../../../utils/Logger';
import {
  exportPlayerContent,
  importPlayerContent,
} from '../../../utils/ChromeStorage';

export const ImportSyncFavButton = (cloudAddress: string) => {
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
    const response = await noxRestore(cloudAddress);
    if (response !== null) {
      const initializedStorage = await importPlayerContent(response);
      await initPlayer(initializedStorage!);
      Snackbar.show({ text: '歌单同步自私有云成功！' });
    } else {
      errorHandling(new Error('云端歌单不存在'), '云端歌单不存在');
    }
    setLoading(false);
    return response;
  };

  return (
    <Tooltip title="下载歌单自私有云">
      <IconButton size="large" onClick={loading ? () => { } : cloudDownload}>
        {loading ? (
          // for the love of bloody mary, why is 1em 28px here but 24px next?
          <CircularProgress sx={AddFavIcon} size="24px" />
        ) : (
          <CloudDownloadIcon sx={AddFavIcon} />
        )}
      </IconButton>
    </Tooltip>
  );
}

export const ExportSyncFavButton = (cloudAddress: string) => {
  const StorageManager = useContext(StorageManagerCtx);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const errorHandling = (e: Error) => {
    console.error(e);
    enqueueSnackbar('歌单上传到私有云失败，错误记录在控制台里', {
      variant: 'error',
    });
    setLoading(false);
  };

  const cloudUpload = async () => {
    setLoading(true);
    const exportedDict = await StorageManager.exportStorageRaw();
    const response = await noxBackup(exportedDict, cloudAddress);
    if (response.status === 200) {
      enqueueSnackbar('歌单上传到私有云成功！', {
        variant: 'success',
        autoHideDuration: 4000,
      });
    } else {
      errorHandling(response);
    }
    setLoading(false);
    return response;
  };

  return (
    <Tooltip title="上传歌单到私有云">
      <IconButton size="large" onClick={loading ? () => { } : cloudUpload}>
        {loading ? (
          // for the love of bloody mary, why is 1em 28px here but 24px next?
          <CircularProgress sx={AddFavIcon} size="24px" />
        ) : (
          <CloudUploadIcon sx={AddFavIcon} />
        )}
      </IconButton>
    </Tooltip>
  );
}

export const SetPersonalCloudTextField = () => {
  const [val, setVal] = React.Usestate('');
  return (
    <TextField
      margin="dense"
      id="PersonalCloudAddress"
      label="私有云地址"
      type="name"
      onChange={e => setVal(e.target.value)}
      value={val}
      autoComplete="off"
      placeholder="末尾带/"
    />
  );
}

export default () => {
  return (
    <View>
      {SetPersonalCloudTextField()}
      <View style={{ flexDirection: 'row' }}>

      </View>
    </View>
  )
}