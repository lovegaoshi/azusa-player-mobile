import { useEffect, useState } from 'react';
import RNFetchBlob from 'react-native-blob-util';

import { getItem, saveItem } from '@utils/ChromeStorageAPI';
import { fetchVideoPlayUrl } from '../utils/mediafetch/bilivideo';
import { customReqHeader } from '@utils/BiliFetch';
import { StorageKeys } from '@enums/Storage';
import { getFileSize } from '../utils/RNUtils';

const TanakaSrc = 'BV1cK42187AE'; //'https://www.bilibili.com/video/BV1cK42187AE/';

const getTanaka = () => getItem(StorageKeys.TANAKA_AMAZING_COMMODITIES);
export const getTakanaDesc = async () => {
  const tanakaPath = await getTanaka();
  return `${tanakaPath}\n${(await getFileSize(tanakaPath)).size / 1000} KiB`;
};
export const deleteTanaka = () => getTanaka().then(RNFetchBlob.fs.unlink);

const DisabledTanaka = 'notanaka';
export const disableTanaka = () => {
  deleteTanaka();
  saveItem(StorageKeys.TANAKA_AMAZING_COMMODITIES, DisabledTanaka);
};

export const enableTanaka = async () => {
  if ((await getTanaka()) !== DisabledTanaka) return;
  saveItem(StorageKeys.TANAKA_AMAZING_COMMODITIES, TanakaSrc);
};

export default () => {
  const [tanaka, setTanaka] = useState<string | undefined>();
  const [initialized, setInitialized] = useState(false);

  const init = async () => {
    const tanakaPath = (await getItem(
      StorageKeys.TANAKA_AMAZING_COMMODITIES
    )) as string | null;
    setInitialized(true);
    if (tanakaPath && (await RNFetchBlob.fs.exists(tanakaPath))) {
      setTanaka(tanakaPath);
      return;
    }
    if (tanakaPath === DisabledTanaka) return;
    const resolvedURL = await fetchVideoPlayUrl(TanakaSrc, true);
    RNFetchBlob.config({
      fileCache: true,
    })
      .fetch('GET', resolvedURL, customReqHeader(resolvedURL))
      .then(res =>
        saveItem(StorageKeys.TANAKA_AMAZING_COMMODITIES, res.path())
      );
  };

  useEffect(() => {
    init();
  }, []);

  return { tanaka, initialized };
};
