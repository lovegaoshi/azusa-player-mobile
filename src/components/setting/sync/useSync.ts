import React, { useState } from 'react';
import Snackbar from 'react-native-snackbar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { strFromU8, decompressSync } from 'fflate';

import { loginDropbox, noxBackup, noxRestore } from './DropboxAuth';
import { useNoxSetting } from '@hooks/useSetting';
import { logger } from '@utils/Logger';
import { exportPlayerContent, importPlayerContent } from '@utils/ChromeStorage';

const useSync = () => {
  const { t } = useTranslation();
  const initPlayer = useNoxSetting(state => state.initPlayer);

  const importNoxExtensionContent = () => {};

  const restoreFromUint8Array = (content: Uint8Array) => {
    let parsedContent;
    try {
      parsedContent = JSON.parse(strFromU8(decompressSync(content)));
    } catch (error) {
      logger.error('parsed content is not a valid compressed JSON.');
      Snackbar.show({
        text: t('Sync.fileNotValidJson'),
      });
      return;
    }
    parsedContent;
  };
};

export default useSync;
