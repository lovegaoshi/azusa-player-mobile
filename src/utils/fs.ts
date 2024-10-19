import RNFetchBlob from 'react-native-blob-util';
import logger from './Logger';

const fsdirs = RNFetchBlob.fs.dirs;

export const writeTxtFile = (
  filename: string,
  content: string[],
  subfolder = '',
) => {
  RNFetchBlob.fs
    .writeStream(
      `${fsdirs.DocumentDir}/${subfolder}${filename}`,
      // encoding, should be one of `base64`, `utf8`, `ascii`
      'utf8',
      // should data append to existing content ?
      false,
    )
    .then(stream => Promise.all(content.map(val => stream.write(val))))
    // Use array destructuring to get the stream object from the first item of the array we get from Promise.all()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .then(([stream]) => stream.close())
    .catch(console.error);
};

export const readTxtFile = (filename: string, subfolder = '') => {
  try {
    return RNFetchBlob.fs
      .readFile(`${fsdirs.DocumentDir}/${subfolder}${filename}`, 'utf8')
      .catch(() => undefined);
  } catch (e) {
    logger.warn(`[fs] readTxtFile error: ${e}`);
    return undefined;
  }
};

export const lsFiles = async (
  dirpath = `${fsdirs.DocumentDir}`,
  prefix = 'ReactNativeBlobUtilTmp_',
) => {
  const list = await RNFetchBlob.fs.ls(dirpath);
  return {
    dirpath,
    list: list.filter(val => val.startsWith(prefix)),
  };
};

export const unlinkFiles = (filelist: string[]) =>
  Promise.all(filelist.map(val => RNFetchBlob.fs.unlink(val).catch()));
