/**
 * refactor:
 * bilisearch workflow:
 * reExtractSearch matches regex patterns and use the corresponding fetch functions;
 * fetch function takes extracted and calls a dataProcess.js fetch function;
 * dataprocess fetch function fetches VIDEOINFO using data.js fetch function, then parses into SONGS
 * data.js fetch function fetches VIDEOINFO.
 * steps to refactor:
 * each site needs a fetch to parse regex extracted, a videoinfo fetcher and a song fetcher.
 */
import { Platform, NativeModules } from 'react-native';
import RNFetchBlob from 'react-native-blob-util';

import { probeMetadata, cacheAlbumArt } from '@utils/ffmpeg/ffmpeg';
import { SOURCE } from '@enums/MediaFetch';
import { regexFetchProps } from './generic';
import SongTS from '@objects/Song';
import logger from '../Logger';
import { filterUndefined } from '../Utils';

const { NoxAndroidAutoModule } = NativeModules;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const songFetch = async (
  fpath: string,
  favlist: string[]
): Promise<NoxMedia.Song[]> => {
  if (Platform.OS !== 'android') return [];
  const mediaFiles = await NoxAndroidAutoModule.listMediaDir(fpath, true);
  return filterUndefined(
    await Promise.all(
      mediaFiles
        .filter((v: any) => !favlist.includes(v.realPath))
        .map(async (v: any) => {
          try {
            const probedMetadata = await probeMetadata(v.realPath);
            return SongTS({
              cid: `${SOURCE.local}-${v.realPath}`,
              bvid: `file://${v.realPath}`,
              name: probedMetadata.tags?.title || v.fileName,
              nameRaw: probedMetadata.tags?.title || v.fileName,
              singer: probedMetadata.tags?.artist || '',
              singerId: probedMetadata.tags?.artist || '',
              cover: '',
              lyric: '',
              page: 0,
              duration: Number(probedMetadata.duration) || 0,
              album: probedMetadata.tags?.album || '',
              source: SOURCE.local,
            });
          } catch (e) {
            logger.warn(e);
            logger.warn(v);
            return null;
          }
        })
    ),
    v => v
  );
};

const regexFetch = async ({
  reExtracted,
  favList = [],
}: regexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => ({
  songList: await songFetch(reExtracted[1]!, favList),
});

const resolveURL = async (song: NoxMedia.Song) => {
  const artworkURI = await cacheAlbumArt(song.bvid);
  const artworkBase64 = await RNFetchBlob.fs.readFile(artworkURI, 'base64');
  return { url: song.bvid, cover: `data:image/png;base64,${artworkBase64}` };
};

const refreshSong = (song: NoxMedia.Song) => song;

export default {
  regexSearchMatch: /local:\/\/(.+)/,
  regexFetch,
  regexResolveURLMatch: /^local-/,
  resolveURL,
  refreshSong,
};
