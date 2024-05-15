import { useState } from 'react';
import i18n from 'i18next';

import { reExtractSongName } from '@stores/appStore';
import { LrcSource } from '@enums/LyricFetch';
import { searchLyricOptions, searchLyric } from '../utils/LyricFetch';
import { useNoxSetting } from '@stores/useApp';
import { logger } from '@utils/Logger';

export interface UpdateLyricMapping {
  resolvedLrc?: NoxNetwork.NoxFetchedLyric;
  newLrcDetail?: Partial<NoxMedia.LyricDetail>;
  lrc: string;
  song: NoxMedia.Song;
  currentTimeOffset: number;
}

export interface FetchedLocalLrc {
  lrcDetail: NoxMedia.LyricDetail;
  localLrc?: string;
}

export default (currentSong?: NoxMedia.Song) => {
  const [lrc, setLrc] = useState(i18n.t('Lyric.loading'));
  const [lrcOptions, setLrcOptions] = useState<NoxNetwork.NoxFetchedLyric[]>(
    []
  );
  const [lrcOption, setLrcOption] = useState<NoxNetwork.NoxFetchedLyric>();
  const [searchText, setSearchText] = useState('');
  const [currentTimeOffset, setCurrentTimeOffset] = useState(0);
  const lyricMapping = useNoxSetting(state => state.lyricMapping);
  const setLyricMapping = useNoxSetting(state => state.setLyricMapping);

  const hasLrcFromLocal = (song = currentSong) => {
    return lyricMapping.has(song?.id || '');
  };

  const getLrcFromLocal = (song = currentSong) => {
    logger.log('[lrc] Loading Lrc from localStorage...');
    return lyricMapping.get(song?.id || '');
  };

  const searchAndSetCurrentLyric = async (
    updateLyricMapping: (props: UpdateLyricMapping) => void,
    index = 0,
    resolvedLrcOptions = lrcOptions,
    resolvedLyric?: NoxMedia.LyricDetail,
    song = currentSong
  ) => {
    // console.debug(`lrcoptions: ${JSON.stringify(resolvedLrcOptions)}`);
    if (resolvedLrcOptions.length === 0 || !song)
      setLrc(i18n.t('Lyric.notFound'));
    else {
      const resolvedLrc = resolvedLrcOptions[index!];
      const lyric = resolvedLyric
        ? await searchLyric(resolvedLyric.lyricKey, resolvedLyric.source)
        : resolvedLrc.lrc ??
          (await searchLyric(resolvedLrc.songMid, resolvedLrc.source));
      setLrc(lyric);
      setLrcOption(resolvedLrc);
      updateLyricMapping({
        resolvedLrc,
        song,
        currentTimeOffset,
        lrc: lyric,
      });
    }
  };

  const fetchAndSetLyricOptions = async (
    adhocTitle?: string,
    lrcSources: LrcSource[] = [],
    artist = currentSong?.singerId,
    optionReorder: (v: NoxNetwork.NoxFetchedLyric[][]) => void = () => undefined
  ) => {
    if (currentSong?.name === undefined) return [];
    try {
      const titleToFetch = reExtractSongName(adhocTitle || '', artist || 0);
      const options = await Promise.all(
        lrcSources.map(source =>
          searchLyricOptions({
            searchKey: titleToFetch,
            source,
            song: currentSong,
          })
        )
      );
      optionReorder(options);
      const flattenedOptions = options.flat();
      setLrcOptions(flattenedOptions);
      return flattenedOptions;
    } catch (error) {
      logger.error(`[lrc] Error fetching lyric options:${error}`);
      setLrcOptions([]);
    }
    return [];
  };

  const initTrackLrcLoad = async (
    fetchAndSetLyricOptions: () => Promise<NoxNetwork.NoxFetchedLyric[]>,
    loadLocalLrc: (
      lyricPromise: Promise<NoxNetwork.NoxFetchedLyric[]>
    ) => Promise<boolean>,
    searchAndSetCurrentLyric: (
      index?: number,
      resolvedLrcOptions?: NoxNetwork.NoxFetchedLyric[]
    ) => unknown
  ) => {
    logger.debug('[lrc] Initiating Lyric with new track...');
    // HACK: UX is too bad if this is not always fetched
    const lrcOptionPromise = fetchAndSetLyricOptions();
    setCurrentTimeOffset(0);
    setLrcOption(undefined);
    setLrc(i18n.t('Lyric.loading'));
    setSearchText(currentSong?.name || '');
    // if failed to init from local,
    if (!(await loadLocalLrc(lrcOptionPromise))) {
      // search from resolved lrc options
      lrcOptionPromise.then(v => searchAndSetCurrentLyric(undefined, v));
    }
  };

  const loadLocalLrc = async (
    localLrcPromise: Promise<FetchedLocalLrc | undefined>,
    fetchNewLrc: () => void
  ) => {
    const localLrcColle = await localLrcPromise;
    if (localLrcColle === undefined) return false;
    const lrcKey = localLrcColle.lrcDetail.lyricKey;
    setLrcOption({ key: lrcKey, songMid: lrcKey, label: lrcKey });
    setCurrentTimeOffset(localLrcColle.lrcDetail.lyricOffset);
    if (localLrcColle.localLrc) {
      setLrc(localLrcColle.localLrc);
    } else {
      logger.debug('[lrc] local lrc no longer exists, fetching new...');
      fetchNewLrc();
    }
    return true;
  };

  return {
    getLrcFromLocal,
    hasLrcFromLocal,
    setLyricMapping,
    searchAndSetCurrentLyric,
    initTrackLrcLoad,
    fetchAndSetLyricOptions,
    loadLocalLrc,

    lrc,
    setLrc,
    lrcOption,
    setLrcOption,
    lrcOptions,
    searchText,
    setSearchText,
    currentTimeOffset,
    setCurrentTimeOffset,
  };
};
