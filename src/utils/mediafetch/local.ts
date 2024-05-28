/* eslint-disable @typescript-eslint/no-explicit-any */
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

import { cacheAlbumArt, base64AlbumArt } from '@utils/ffmpeg/ffmpeg';
import { Source } from '@enums/MediaFetch';
import SongTS from '@objects/Song';
import logger from '../Logger';

const { NoxAndroidAutoModule } = NativeModules;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const songFetch = async (
  fpath: string,
  favlist: string[]
): Promise<NoxMedia.Song[]> => {
  if (Platform.OS !== 'android') return [];
  const mediaFiles: NoxUtils.NoxFileUtilMediaInfo[] =
    await NoxAndroidAutoModule.listMediaDir(fpath, true);
  const uniqMediaFiles = mediaFiles.filter(v => !favlist.includes(v.realPath));
  return uniqMediaFiles.map(v =>
    SongTS({
      cid: `${Source.local}-${v.realPath}`,
      bvid: `file://${v.realPath}`,
      name: v.title,
      nameRaw: v.title,
      singer: v.artist,
      singerId: v.artist,
      cover: '',
      lyric: '',
      page: 0,
      duration: v.duration / 1000,
      album: v.album,
      source: Source.local,
    })
  );
};

const regexFetch = async ({
  reExtracted,
  favList = [],
}: NoxNetwork.RegexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => ({
  songList: await songFetch(reExtracted[1]!, favList),
});

const resolveURL = async (song: NoxMedia.Song) => {
  let cover: string | undefined = undefined;
  if (Platform.OS === 'android') {
    const artworkUri = await cacheAlbumArt(song.bvid);
    console.log('[APMlocal]', artworkUri, song);
    if (artworkUri) {
      cover = await NoxAndroidAutoModule.getUri(artworkUri);
    }
  }
  return { url: song.bvid, cover };
};

const resolveArtwork = async (song: NoxMedia.Song) => {
  try {
    const artworkUri = await cacheAlbumArt(song.bvid);
    if (artworkUri) {
      return base64AlbumArt(artworkUri);
    }
  } catch (e) {
    logger.warn(`[localResolver] cannot resolve artwork of ${song.bvid}`);
  }
};

const refreshSong = (song: NoxMedia.Song) => song;

export default {
  regexSearchMatch: /local:\/\/(.+)/,
  regexFetch,
  regexResolveURLMatch: /^local-/,
  resolveURL,
  refreshSong,
  resolveArtwork,
};
