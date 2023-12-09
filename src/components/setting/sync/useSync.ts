/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import Snackbar from 'react-native-snackbar';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { strFromU8, decompressSync } from 'fflate';

import { logger } from '@utils/Logger';
import {
  importPlayerContentRaw,
  initPlayerObject,
  clearPlaylistNImport,
  addImportedPlaylist,
} from '@utils/ChromeStorage';
import useInitializeStore from '@stores/initializeStores';
import { STORAGE_KEYS } from '@enums/Storage';

/**
 * this hook will handle all sync back from file operations. it will
 * contain states designated for a GenericCheckboxDialog that selects what
 * is what, so this hook should be in SyncSettings and the relevant functions
 * should then be passed down to XSyncButton via props.
 */
const useSync = () => {
  const { t } = useTranslation();
  const { initializeStores } = useInitializeStore();
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
            text: String(t('Sync.NoxExtensionCancel')),
            onPress: () => {
              reject('user said no');
            },
            style: 'cancel',
          },
          {
            text: String(t('Sync.NoxExtensionOverwrite')),
            onPress: async () => {
              await clearPlaylistNImport(parsedContent);
              await initializeStores(await initPlayerObject());
              resolve(true);
            },
          },
          {
            text: String(t('Sync.NoxExtensionAppend')),
            onPress: async () => {
              setSyncCheckVisible(true);
              setNoxExtensionContent(
                parsedContent[STORAGE_KEYS.MY_FAV_LIST_KEY].map(
                  (val: any) =>
                    parsedContent[val].title || parsedContent[val].info.title
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
      .map((val, index) =>
        val
          ? cachedParsedContent[cachedParsedContent.MyFavList[index]]
          : undefined
      )
      .filter(val => val);
    await addImportedPlaylist(checkedPlaylists);
    await initializeStores(await initPlayerObject());
    setSyncCheckVisible(false);
    Snackbar.show({ text: t('Sync.DropboxDownloadSuccess') });
  };

  const isSyncNoxExtension = (parsedContent: any) => {
    return Array.isArray(parsedContent.MyFavList);
  };

  const restoreFromUint8Array = async (content: Uint8Array) => {
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
        await syncNoxExtension(parsedContent);
        return;
      } else {
        await initializeStores(await importPlayerContentRaw(parsedContent));
        return;
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
    setSyncCheckVisible,
    noxExtensionContent,
  };
};

export default useSync;
