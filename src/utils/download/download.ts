import RNFetchBlob from 'react-native-blob-util';
import { PermissionsAndroid } from 'react-native';

import { resolveCachedPath } from '../RNTPUtils';
import { logger } from '../Logger';
import { ffmpegToMP3 } from '../ffmpeg/ffmpeg';
import { displayDLComplete, displayDLProgress } from './notification';
import { getSongDownloadPath } from '@utils/db/sqlAPI';
import { setSongDownloadPath } from '../db/sqlStorage';

interface CopyCacheToDir {
  song: NoxMedia.Song;
  fsdir?: string;
}
export const copyCacheToDir = async ({
  song,
  fsdir = 'APM',
}: CopyCacheToDir) => {
  const storedPath = getSongDownloadPath(song.id);
  if (await RNFetchBlob.fs.exists(storedPath ?? '')) {
    logger.debug(`[APMDownload] ${song.parsedName} already downloaded.`);
    return storedPath;
  }
  const resolvedPath = await resolveCachedPath({ song, notify: true });
  if (resolvedPath === undefined) {
    logger.warn(
      `[Download] ${song.bvid} failed to download. \
        check for cache settings or network connection.`,
    );
    return;
  }
  displayDLProgress(song);
  let result: string;
  try {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO);
    const filePath = await ffmpegToMP3({
      fspath: resolvedPath,
      song,
      unlink: false,
    });

    if (!(await RNFetchBlob.fs.exists(filePath))) {
      throw new Error(
        `[download] ${song.parsedName} failed to be converted to mp3. check debug logs`,
      );
    }

    result = await RNFetchBlob.MediaCollection.copyToMediaStore(
      {
        name: `${song.parsedName}.mp3`,
        parentFolder: fsdir,
        mimeType: 'audio/mp3',
      },
      'Audio',
      filePath,
    );

    RNFetchBlob.fs.unlink(filePath).catch();
    displayDLComplete(song);
  } catch (e) {
    // HACK
    displayDLComplete(song);
    logger.warn(
      `[Download] ${song.parsedName} failed to copy to music dir: ${e}`,
    );
    logger.warn(
      '[Download] now copying the cached object to mediaStore with mp3 extension instead',
    );
    result = await RNFetchBlob.MediaCollection.copyToMediaStore(
      {
        name: `${song.parsedName}.mp3`,
        parentFolder: fsdir,
        mimeType: 'audio/mp3',
      },
      'Audio',
      resolvedPath,
    );
  }
  await setSongDownloadPath(song.id, result);
  return result;
};
