import { logger } from '@utils/Logger';
import { readTxtFile, writeTxtFile } from '@utils/fs';
import useLyric from './useLyric';

export default (currentSong?: NoxMedia.Song) => {
  const usedLyric = useLyric(currentSong);

  const updateLyricMapping = ({
    resolvedLrc,
    newLrcDetail = {},
    lrc,
    song,
    currentTimeOffset,
  }: {
    resolvedLrc?: NoxNetwork.NoxFetchedLyric;
    newLrcDetail?: Partial<NoxMedia.LyricDetail>;
    lrc: string;
    song: NoxMedia.Song;
    currentTimeOffset: number;
  }) => {
    if (resolvedLrc) {
      const lrcpath = `${song.id}.txt`;
      writeTxtFile(lrcpath, [newLrcDetail.lyric || lrc], 'lrc/');
      const lyricDeatail: NoxMedia.LyricDetail = {
        songId: song.id,
        lyricKey: resolvedLrc.key,
        lyricOffset: currentTimeOffset,
        ...newLrcDetail,
        lyric: lrcpath,
        source: resolvedLrc.source,
      };
      usedLyric.setLyricMapping(lyricDeatail);
    }
  };

  const getLrcFromLocal = async (song?: NoxMedia.Song) => {
    const lrcDetail = usedLyric.getLrcFromLocal(song);
    if (lrcDetail === undefined) return;
    let localLrc: string | undefined = undefined;
    if (lrcDetail.lyric.endsWith('.txt')) {
      localLrc = await readTxtFile(lrcDetail.lyric, 'lrc/');
      if (localLrc) {
        logger.debug('[lrc] read local lrc and loading...');
      }
    } else {
      logger.debug(
        '[lrc] local lrc seems to be the content itself, loading that...'
      );
      localLrc = lrcDetail.lyric;
    }
    return {
      lrcDetail,
      localLrc,
    };
  };

  const searchAndSetCurrentLyric = async (
    index = 0,
    resolvedLrcOptions = usedLyric.lrcOptions,
    resolvedLyric?: NoxMedia.LyricDetail,
    song = currentSong
  ) =>
    usedLyric.searchAndSetCurrentLyric(
      updateLyricMapping,
      index,
      resolvedLrcOptions,
      resolvedLyric,
      song
    );

  return {
    ...usedLyric,
    updateLyricMapping,
    getLrcFromLocal,
    searchAndSetCurrentLyric,
  };
};
