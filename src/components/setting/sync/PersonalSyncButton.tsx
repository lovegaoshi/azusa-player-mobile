import React, { useContext, useState } from 'react';
import Snackbar from 'react-native-snackbar';
import { View, ActivityIndicator } from 'react-native';
import { IconButton, TextInput } from 'react-native-paper';
import { useDebounce } from 'use-debounce';
import { useUpdateEffect } from 'react-use';

import { noxBackup, noxRestore } from './PersonalCloudAuth';
import { useNoxSetting } from '../../../hooks/useSetting';
import { logger } from '../../../utils/Logger';
import {
  exportPlayerContent,
  importPlayerContent,
} from '../../../utils/ChromeStorage';

interface props {
  cloudAddress: string;
  cloudID?: string;
}

const ImportSyncFavButton = ({ cloudAddress, cloudID }: props) => {
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
    const response = await noxRestore(cloudAddress, cloudID);
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

  return loading ? (
    <ActivityIndicator size={60} />
  ) : (
    <IconButton icon="cloud-download" onPress={cloudDownload} size={60} />
  );
};

const ExportSyncFavButton = ({ cloudAddress, cloudID }: props) => {
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
    const response = await noxBackup(exportedDict, cloudAddress, cloudID);
    if (response.status === 200) {
      Snackbar.show({ text: '歌单上传到私有云成功！' });
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

const personalCloudIPTextField: textProps = {
  settingKey: 'personalCloudIP',
  label: '私有云地址',
  placeholder: '末尾带/',
};

const personalCloudIDTextField: textProps = {
  settingKey: 'personalCloudID',
  label: '私有云key',
  placeholder: '',
};

const SetTextField = React.memo(
  ({ settingKey, label, placeholder }: textProps) => {
    const playerSetting = useNoxSetting(state => state.playerSetting);
    const playerStyle = useNoxSetting(state => state.playerStyle);
    const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);
    const [val, setVal] = useState(playerSetting[settingKey]);
    const [debouncedVal] = useDebounce(val, 1000);

    useUpdateEffect(
      () => setPlayerSetting({ [settingKey]: debouncedVal }),
      [debouncedVal]
    );

    return (
      <TextInput
        label={label}
        onChange={e => setVal(e.nativeEvent.text)}
        value={val}
        placeholder={placeholder}
        selectTextOnFocus
        selectionColor={playerStyle.customColors.textInputSelectionColor}
        textColor={playerStyle.colors.text}
      />
    );
  },
  () => true
);

export default () => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  return (
    <View>
      <SetTextField {...personalCloudIPTextField} />
      <SetTextField {...personalCloudIDTextField} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          alignContent: 'center',
          justifyContent: 'center',
        }}
      >
        <ImportSyncFavButton
          cloudAddress={playerSetting.personalCloudIP}
          cloudID={playerSetting.personalCloudID}
        />
        <View style={{ width: 20 }}></View>
        <ExportSyncFavButton
          cloudAddress={playerSetting.personalCloudIP}
          cloudID={playerSetting.personalCloudID}
        />
      </View>
    </View>
  );
};
