/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
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
import { StorageKeys } from '@enums/Storage';
import useSnack from '@stores/useSnack';

/**
 * this hook will handle all sync back from file operations. it will
 * contain states designated for a GenericCheckboxDialog that selects what
 * is what, so this hook should be in SyncSettings and the relevant functions
 * should then be passed down to XSyncButton via props.
 */
const useSync = () => {
  const { t } = useTranslation();
  const setSnack = useSnack(state => state.setSnack);
  const { initializeStores } = useInitializeStore();
  const [syncCheckVisible, setSyncCheckVisible] = useState(false);
  const [noxExtensionContent, setNoxExtensionContent] = useState<string[]>([]);
  const [cachedParsedContent, setCachedParsedContent] = useState<any>(null);

  const syncNoxExtension = (parsedContent: any) =>
    new Promise((resolve, reject) => {
      Alert.alert(
        t('Sync.NoxExtensionImportTitle'),
        t('Sync.NoxExtensionImportMsg'),
        [
          {
            text: t('Sync.NoxExtensionCancel'),
            onPress: () => {
              reject(Error('user said no'));
            },
            style: 'cancel',
          },
          {
            text: t('Sync.NoxExtensionOverwrite'),
            onPress: async () => {
              await clearPlaylistNImport(parsedContent);
              await initializeStores(await initPlayerObject());
              resolve(true);
            },
          },
          {
            text: t('Sync.NoxExtensionAppend'),
            // HACK: this only supports sql stored playlists compatibility wise
            // playlist.songList will be hydrated in the dumbest way possible
            onPress: () => {
              setSyncCheckVisible(true);
              setNoxExtensionContent(
                parsedContent[StorageKeys.MY_FAV_LIST_KEY].map(
                  (val: string) =>
                    parsedContent[val].title ?? parsedContent[val].info.title,
                ),
              );
              setCachedParsedContent(parsedContent);
              resolve(true);
            },
          },
        ],
      );
    });

  const syncPartialNoxExtension = async (checkedPlaylistIndexes: boolean[]) => {
    const checkedPlaylists = checkedPlaylistIndexes
      .map((val, index) =>
        val
          ? {
              ...cachedParsedContent[cachedParsedContent.MyFavList[index]],
              songList:
                cachedParsedContent[
                  `${cachedParsedContent.MyFavList[index]}-songList`
                  // hydrate here
                ] ?? [],
            }
          : undefined,
      )
      .filter(val => val);
    await addImportedPlaylist(checkedPlaylists);
    await initializeStores(await initPlayerObject());
    setSyncCheckVisible(false);
    setSnack({ snackMsg: { success: t('Sync.DropboxDownloadSuccess') } });
  };

  const isSyncNoxExtension = (parsedContent: any) => {
    return !Array.isArray(parsedContent);
  };

  const restoreFromUint8Array = async (content: Uint8Array) => {
    let parsedContent;
    try {
      parsedContent = JSON.parse(strFromU8(decompressSync(content)));
    } catch (e) {
      logger.error(`parsed content is not a valid compressed JSON: ${e}`);
      setSnack({ snackMsg: { success: t('Sync.fileNotValidJson') } });
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
      setSnack({ snackMsg: { success: t('Sync.DropboxDownloadFail') } });
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
