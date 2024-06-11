import { useEffect, useState } from 'react';
import { getItem, saveItem } from '@utils/ChromeStorage';
import RNFetchBlob from 'react-native-blob-util';

import { fetchVideoPlayUrl } from '../utils/mediafetch/bilivideo';
import { customReqHeader } from '@utils/BiliFetch';
import { StorageKeys } from '@enums/Storage';

const TanakaSrc = 'BV1cK42187AE'; //'https://www.bilibili.com/video/BV1cK42187AE/';

export default () => {
  const [tanaka, setTanaka] = useState<string | undefined>();
  const [initialized, setInitialized] = useState(false);

  const init = async () => {
    const tanakaPath = (await getItem(
      StorageKeys.TANAKA_AMAZING_COMMODITIES
    )) as string | null;
    if (tanakaPath && (await RNFetchBlob.fs.exists(tanakaPath))) {
      setTanaka(tanakaPath);
      setInitialized(true);
      return;
    }
    setInitialized(true);
    const resolvedURL = await fetchVideoPlayUrl(TanakaSrc);
    RNFetchBlob.config({
      fileCache: true,
    })
      .fetch('GET', resolvedURL, customReqHeader(resolvedURL))
      .then(res => {
        const resolvedPath = res.path();
        setTanaka(resolvedPath);
        saveItem(StorageKeys.TANAKA_AMAZING_COMMODITIES, resolvedPath);
      });
  };

  useEffect(() => {
    init();
  }, []);

  return { tanaka, initialized };
};
