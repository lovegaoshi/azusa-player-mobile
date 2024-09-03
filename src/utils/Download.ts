import RNFetchBlob from 'react-native-blob-util';
import { PermissionsAndroid } from 'react-native';

import { resolveCachedPath } from './RNTPUtils';
import { logger } from './Logger';
import { ffmpegToMP3 } from './ffmpeg/ffmpeg';

interface CopyCacheToDir {
  song: NoxMedia.Song;
  fsdir?: string;
}
export const copyCacheToDir = async ({
  song,
  fsdir = 'APM',
}: CopyCacheToDir) => {
  const resolvedPath = await resolveCachedPath({ song });
  if (resolvedPath === undefined) {
    logger.warn(
      `[Download] ${song.bvid} failed to download. \
        check for cache settings or network connection.`
    );
    return;
  }
  try {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO);
    const filePath = await ffmpegToMP3({
      fspath: resolvedPath,
      song,
      unlink: false,
    });
    const result = await RNFetchBlob.MediaCollection.copyToMediaStore(
      {
        name: `${song.parsedName}.mp3`,
        parentFolder: fsdir,
        mimeType: 'audio/mp3',
      },
      'Audio',
      filePath
    );
    RNFetchBlob.fs.unlink(filePath).catch();
    return result;
  } catch (e) {
    logger.warn(
      `[Download] ${song.parsedName} failed to copy to music dir: ${e}`
    );
  }
};
