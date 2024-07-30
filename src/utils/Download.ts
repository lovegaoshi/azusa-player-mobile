import RNFetchBlob from 'react-native-blob-util';

import { resolveCachedPath } from './RNTPUtils';
import { logger } from './Logger';
import { getExt } from './Utils';

interface CopyCacheToDir {
  song: NoxMedia.Song;
  fsdir: string;
}
export const copyCacheToDir = async ({ song, fsdir }: CopyCacheToDir) => {
  const filePath = await resolveCachedPath({ song });
  if (filePath === undefined) {
    logger.warn(
      `[Download] ${song.bvid} failed to download. \
        check for cache settings or network connection.`
    );
    return;
  }
  try {
    RNFetchBlob.MediaCollection.copyToMediaStore(
      {
        name: `${song.parsedName}.mp3`,
        parentFolder: 'APM',
        mimeType: 'audio/mp3',
      },
      'Audio',
      filePath
    );
    logger.debug(`[Download] cp to dir ${fsdir} is not supported.`);
    RNFetchBlob.fs.mkdir(`${RNFetchBlob.fs.dirs.MusicDir}/APM`);
    const dest = `${RNFetchBlob.fs.dirs.MusicDir}/APM\
/${song.parsedName}-${song.singer} [${song.id}].${getExt(filePath)}`;
    await RNFetchBlob.fs.cp(filePath, dest);
    RNFetchBlob.fs.scanFile([{ path: dest }]);
    return dest;
  } catch (e) {
    logger.warn(
      `[Download] ${song.parsedName} failed to copy to music dir: ${e}`
    );
  }
};
