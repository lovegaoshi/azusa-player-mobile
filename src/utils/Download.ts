import RNFetchBlob from 'react-native-blob-util';

import { resolveCachedPath } from './RNTPUtils';
import { logger } from './Logger';
import { getExt } from './Utils';

interface CopyCacheToDir {
  songs: NoxMedia.Song[];
  fsdir: string;
}
export const copyCacheToDir = async ({ songs, fsdir }: CopyCacheToDir) => {
  for (const song of songs) {
    const filePath = await resolveCachedPath({ song });
    if (filePath === undefined) {
      logger.warn(
        `[Download] ${song.bvid} failed to download. \
        check for cache settings or network connection.`
      );
      continue;
    }
    try {
      console.log(
        filePath,
        `${fsdir}/APM/\
${song.parsedName}-${song.singer} [${song.id}].${getExt(filePath)}`
      );
      await RNFetchBlob.fs.cp(
        filePath,
        `${fsdir}/\
${song.parsedName}-${song.singer} [${song.id}].${getExt(filePath)}`
      );
    } catch (e) {
      logger.warn(
        `[Download] ${song.parsedName} failed to copy to music dir: ${e}`
      );
    }
  }
};
