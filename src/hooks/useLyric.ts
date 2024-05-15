import React, { useEffect, useState } from 'react';
import i18n from 'i18next';

import { searchLyricOptions, searchLyric } from '@utils/LyricFetch';
import { useNoxSetting } from '@stores/useApp';
import { logger } from '@utils/Logger';

export interface UpdateLyricMapping {
  resolvedLrc?: NoxNetwork.NoxFetchedLyric;
  newLrcDetail?: Partial<NoxMedia.LyricDetail>;
  lrc: string;
  song: NoxMedia.Song;
  currentTimeOffset: number;
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

  return {
    getLrcFromLocal,
    hasLrcFromLocal,
    setLyricMapping,
    searchAndSetCurrentLyric,

    lrc,
    setLrc,
    lrcOption,
    setLrcOption,
    lrcOptions,
    setLrcOptions,
    searchText,
    setSearchText,
    currentTimeOffset,
    setCurrentTimeOffset,
  };
};
