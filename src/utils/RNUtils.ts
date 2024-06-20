import { Platform } from 'react-native';
import RNFetchBlob from 'react-native-blob-util';

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';

export const getFileSize = async (fpath: string) => {
  try {
    return await RNFetchBlob.fs.stat(fpath);
  } catch {
    return { size: 0 };
  }
};
