import React, { useState } from 'react';
import Snackbar from 'react-native-snackbar';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { strFromU8, decompressSync } from 'fflate';

import { useNoxSetting } from '@hooks/useSetting';
import { logger } from '@utils/Logger';
import {
  importPlayerContentRaw,
  initPlayerObject,
  clearPlaylistNImport,
  addImportedPlaylist,
} from '@utils/ChromeStorage';

/**
 * this hook will handle all sync back from file operations. it will
 * contain states designated for a GenericCheckboxDialog that selects what
 * is what, so this hook should be in SyncSettings and the relevant functions
 * should then be passed down to XSyncButton via props.
 */
const useSync = () => {
  const { t } = useTranslation();
  const initPlayer = useNoxSetting(state => state.initPlayer);
  const [syncCheckVisible, setSyncCheckVisible] = useState(false);
  const [noxExtensionContent, setNoxExtensionContent] = useState<string[]>([]);
  const [cachedParsedContent, setCachedParsedContent] = useState<any>(null);

  const syncNoxExtension = async (parsedContent: any) => {
    return new Promise((resolve, reject) => {
      Alert.alert(
        t('Sync.NoxExtensionImportTitle'),
        String(t('Sync.NoxExtensionImportMsg')),
        [
          {
            text: String(t('SyncNoxExtensionCancel')),
            onPress: () => {
              reject('user said no');
            },
            style: 'cancel',
          },
          {
            text: String(t('SyncNoxExtensionOverwrite')),
            onPress: async () => {
              await clearPlaylistNImport(parsedContent);
              resolve(true);
            },
          },
          {
            text: String(t('SyncNoxExtensionAppend')),
            onPress: async () => {
              setSyncCheckVisible(true);
              setNoxExtensionContent(
                parsedContent['MyFavList'].map(
                  (val: any) => parsedContent[val].info.title
                )
              );
              setCachedParsedContent(parsedContent);
              resolve(true);
            },
          },
        ]
      );
    });
  };

  const syncPartialNoxExtension = async (checkedPlaylistIndexes: boolean[]) => {
    const checkedPlaylists = checkedPlaylistIndexes
      .map((val, index) => (val ? cachedParsedContent[index] : undefined))
      .filter(val => val);
    await addImportedPlaylist(checkedPlaylists);
    await initPlayer(await initPlayerObject());
    Snackbar.show({ text: t('Sync.DropboxDownloadSuccess') });
  };

  const isSyncNoxExtension = (parsedContent: any) => {
    return Array.isArray(parsedContent.MyFavList);
  };

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
    try {
      if (isSyncNoxExtension(parsedContent)) {
        return syncNoxExtension(parsedContent);
      } else {
        return importPlayerContentRaw(parsedContent);
      }
    } catch (error) {
      logger.error(error);
      Snackbar.show({
        text: t('Sync.DropboxDownloadFail'),
      });
    }
  };

  return {
    restoreFromUint8Array,
    syncPartialNoxExtension,
    syncCheckVisible,
    noxExtensionContent,
  };
};

export default useSync;
