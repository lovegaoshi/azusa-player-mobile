import React, { useContext, useState } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useSnackbar } from 'notistack';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import { noxBackup, noxRestore } from '../../../utils/PersonalCloudAuth';
import { StorageManagerCtx } from '../../../contexts/StorageManagerContext';

export function ImportSyncFavButton(
  AddFavIcon: Object,
  cloudAddress: string | undefined = undefined,
) {
  const StorageManager = useContext(StorageManagerCtx);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const errorHandling = (
    e: Object,
    msg = '歌单同步自私有云失败，错误记录在控制台里',
  ) => {
    console.error(e);
    enqueueSnackbar(msg, {
      variant: 'error',
    });
    setLoading(false);
  };

  const cloudDownload = async () => {
    setLoading(true);
    const response = await noxRestore(cloudAddress);
    if (response !== null) {
      await StorageManager.importStorageRaw(response);
      enqueueSnackbar('歌单同步自私有云成功！', {
        variant: 'success',
        autoHideDuration: 4000,
      });
    } else {
      errorHandling('云端歌单不存在', '云端歌单不存在');
    }
    setLoading(false);
    return response;
  };

  return (
    <Tooltip title='下载歌单自私有云'>
      <IconButton size='large' onClick={loading ? () => {} : cloudDownload}>
        {loading ? (
          // for the love of bloody mary, why is 1em 28px here but 24px next?
          <CircularProgress sx={AddFavIcon} size='24px' />
        ) : (
          <CloudDownloadIcon sx={AddFavIcon} />
        )}
      </IconButton>
    </Tooltip>
  );
}

export function ExportSyncFavButton(
  AddFavIcon: Object,
  cloudAddress: string | undefined = undefined,
) {
  const StorageManager = useContext(StorageManagerCtx);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const errorHandling = (e: Object) => {
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
    <Tooltip title='上传歌单到私有云'>
      <IconButton size='large' onClick={loading ? () => {} : cloudUpload}>
        {loading ? (
          // for the love of bloody mary, why is 1em 28px here but 24px next?
          <CircularProgress sx={AddFavIcon} size='24px' />
        ) : (
          <CloudUploadIcon sx={AddFavIcon} />
        )}
      </IconButton>
    </Tooltip>
  );
}

export function SetPersonalCloudTextField(val: string, setVal: Function) {
  return (
    <TextField
      margin='dense'
      id='PersonalCloudAddress'
      label='私有云地址'
      type='name'
      onChange={(e) => setVal(e.target.value)}
      value={val}
      autoComplete='off'
      placeholder='末尾带/'
    />
  );
}
