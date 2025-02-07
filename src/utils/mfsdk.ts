import { saveItem, getItem } from '@utils/ChromeStorageAPI';
import { StorageKeys } from '@enums/Storage';
import { readTxtFile, rmTxtFile, writeTxtFile } from '@utils/fs';
import logger from './Logger';
import { loadEvalPlugin, MFsdk } from './mediafetch/evalsdk';
import bFetch from './BiliFetch';
import { filterUndefined } from './Utils';

const mfsdkSubFolder = 'mfsdk';

const getMFsdk = (): Promise<string[]> => getItem(StorageKeys.MFSDK_PATHS, []);

export const rmMFsdks = async (paths: string[]) => {
  const mfsdkPaths = await getMFsdk();
  saveItem(
    StorageKeys.MFSDK_PATHS,
    mfsdkPaths.filter(p => !paths.includes(p)),
  );
  paths.forEach(path => rmTxtFile(path, mfsdkSubFolder));
};

export const addMFsdks = async (paths: string[]) => {
  const mfsdkPaths = await getMFsdk();
  saveItem(StorageKeys.MFSDK_PATHS, [...new Set([...mfsdkPaths, ...paths])]);
};

export const initMFsdk = async () => {
  const mfsdkPaths = await getMFsdk();
  const mfsdks = await Promise.all(
    mfsdkPaths.map(async p => {
      try {
        const sdkContent = await readTxtFile(p, mfsdkSubFolder);
        if (sdkContent === undefined) {
          throw Error(`[mfsdk] ${p} cannot be read! corrupted/DNE`);
        }
        return loadEvalPlugin(sdkContent, p);
      } catch (e) {
        logger.warn(`[mfsdk] failed to load mfsdks from init: ${e}`);
        return;
      }
    }),
  );
  return filterUndefined(mfsdks, v => v);
};

export const fetchMFsdk = async (url: string): Promise<MFsdk[]> => {
  try {
    const res = await bFetch(url);
    const text = await res.text();
    try {
      const json = JSON.parse(text) as { plugins: { url: string }[] };
      const sdks = await Promise.all(json.plugins.map(p => fetchMFsdk(p.url)));
      return sdks.flat();
    } catch {
      // do nothing
    }
    const loadedSDK = loadEvalPlugin(text, url);
    const sdkLocalPath = `${loadedSDK.platform}.${loadedSDK.version}.js`;
    loadedSDK.path = sdkLocalPath;
    writeTxtFile(sdkLocalPath, [text], mfsdkSubFolder);
    return [loadedSDK];
  } catch (e) {
    logger.warn(`[mfsdk] failed to fetch and parse ${url}: ${e}`);
  }
  return [];
};
