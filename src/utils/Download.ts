import RNFetchBlob from 'react-native-blob-util';

import { resolveCachedPath } from './RNTPUtils';
import { logger } from './Logger';
import { getExt } from './Utils';

interface CopyCacheToDir {
  song: NoxMedia.Song;
  fsdir?: string;
}
export const copyCacheToDir = async ({
  song,
  fsdir = 'APM',
}: CopyCacheToDir) => {
  const filePath = await resolveCachedPath({ song });
  if (filePath === undefined) {
    logger.warn(
      `[Download] ${song.bvid} failed to download. \
        check for cache settings or network connection.`
    );
    return;
  }
  try {
    return await RNFetchBlob.MediaCollection.copyToMediaStore(
      {
        name: `${song.parsedName}.mp3`,
        parentFolder: fsdir,
        mimeType: 'audio/mp3',
      },
      'Audio',
      filePath
    );
  } catch (e) {
    logger.warn(
      `[Download] ${song.parsedName} failed to copy to music dir: ${e}`
    );
  }
};
