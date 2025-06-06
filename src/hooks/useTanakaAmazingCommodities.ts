import { useEffect, useState } from 'react';
import RNFetchBlob from 'react-native-blob-util';

import { getItem, saveItem } from '@utils/ChromeStorageAPI';
import { fetchVideoPlayUrl } from '../utils/mediafetch/bilivideo';
import { customReqHeader } from '@utils/BiliFetch';
import { StorageKeys } from '@enums/Storage';
import { getFileSize, validateFile } from '../utils/RNUtils';
import { weightedChoice } from '../utils/Utils';

const TanakaSrc = weightedChoice([
  ['BV1cK42187AE', 99],
  ['BV1kf421q7jK', 1],
]);

const getTanaka = () => getItem(StorageKeys.TANAKA_AMAZING_COMMODITIES);
export const getTakanaDesc = async () => {
  const tanakaPath = await getTanaka();
  return `${tanakaPath}\n${(await getFileSize(tanakaPath)) / 1000} KiB`;
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
      StorageKeys.TANAKA_AMAZING_COMMODITIES,
    )) as string | null;
    if (await validateFile(tanakaPath)) {
      setTanaka(tanakaPath!);
      setInitialized(true);
      return;
    }
    setInitialized(true);
    if (tanakaPath === DisabledTanaka) return;
    const resolvedURL = await fetchVideoPlayUrl(TanakaSrc, true);
    RNFetchBlob.config({
      fileCache: true,
    })
      .fetch('GET', resolvedURL, customReqHeader(resolvedURL))
      .then(res =>
        saveItem(StorageKeys.TANAKA_AMAZING_COMMODITIES, res.path()),
      );
  };

  useEffect(() => {
    init();
  }, []);

  return { tanaka, initialized };
};
