import { logger } from '@utils/Logger';
import { readTxtFile, writeTxtFile } from '@utils/fs';
import useLyric from './useLyric';
import { LrcSource } from '@enums/LyricFetch';

const LYRIC_OFFSET_INTERVAL = 0.5;

export default function useLyricRN(currentSong?: NoxMedia.Song, artist = '') {
  const usedLyric = useLyric(currentSong);

  const updateLyricMapping = ({
    resolvedLrc,
    newLrcDetail = {},
    lrc,
    song,
    currentTimeOffset,
  }: {
    resolvedLrc?: NoxLyric.NoxFetchedLyric;
    newLrcDetail?: Partial<NoxMedia.LyricDetail>;
    lrc: string;
    song: NoxMedia.Song;
    currentTimeOffset: number;
  }) => {
    if (resolvedLrc) {
      const lrcpath = `${song.id}.txt`;
      writeTxtFile(lrcpath, [newLrcDetail.lyric ?? lrc], 'lrc');
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
    const lrcDetail = await usedLyric.getLrcFromLocal(song);
    if (lrcDetail === undefined) return;
    let localLrc: string | undefined = undefined;
    if (lrcDetail.lyric.endsWith('.txt')) {
      localLrc = await readTxtFile(lrcDetail.lyric, 'lrc');
      if (localLrc) {
        logger.debug('[lrc] read local lrc and loading...');
      }
    } else {
      logger.debug(
        '[lrc] local lrc seems to be the content itself, loading that...',
      );
      localLrc = lrcDetail.lyric;
    }
    return {
      lrcDetail,
      localLrc,
    };
  };

  const searchAndSetCurrentLyric = ({
    index = 0,
    resolvedLrcOptions = usedLyric.lrcOptions,
    resolvedLyric,
    song = currentSong,
  }: NoxLyric.SearchLyricL) =>
    usedLyric.searchAndSetCurrentLyric({
      updateLyricMapping,
      index,
      resolvedLrcOptions,
      resolvedLyric,
      song,
    });

  const loadLocalLrc = (lyricPromise: Promise<NoxLyric.NoxFetchedLyric[]>) => {
    const localLrcColle = getLrcFromLocal(currentSong);
    return usedLyric.loadLocalLrc(localLrcColle, async () =>
      searchAndSetCurrentLyric({
        resolvedLrcOptions: await lyricPromise,
        resolvedLyric: (await localLrcColle)?.lrcDetail,
      }),
    );
  };

  const fetchAndSetLyricOptions = (
    adhocTitle = currentSong?.parsedName ?? currentSong?.name,
  ) =>
    usedLyric.fetchAndSetLyricOptions(
      adhocTitle,
      [
        LrcSource.YT,
        LrcSource.QQQrc,
        LrcSource.QQ,
        LrcSource.BiliBili,
        LrcSource.Kugou,
        LrcSource.LrcLib,
        LrcSource.Netease,
      ],
      artist,
      options => {
        options[0].length !== 1 && options.push(options.shift()!);
      },
    );

  const addSubtractOffset = (isAdd: boolean) => {
    const newTimeOffset = isAdd
      ? usedLyric.currentTimeOffset + LYRIC_OFFSET_INTERVAL
      : usedLyric.currentTimeOffset - LYRIC_OFFSET_INTERVAL;
    usedLyric.setCurrentTimeOffset(newTimeOffset);
    updateLyricMapping({
      resolvedLrc: usedLyric.lrcOption,
      newLrcDetail: { lyricOffset: newTimeOffset },
      lrc: usedLyric.lrc,
      song: currentSong!,
      currentTimeOffset: newTimeOffset,
    });
  };

  const initTrackLrcLoad = () =>
    usedLyric.initTrackLrcLoad(
      fetchAndSetLyricOptions,
      loadLocalLrc,
      searchAndSetCurrentLyric,
    );

  return {
    ...usedLyric,
    searchAndSetCurrentLyric,
    fetchAndSetLyricOptions,
    addSubtractOffset,
    initTrackLrcLoad,
  };
}
