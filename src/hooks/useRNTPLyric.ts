// this is a useLyric hook that manages the various useEffects previously in Lryic.tsx

import { Track } from 'react-native-track-player';
import { useEffect } from 'react';

import useLyric from '@hooks/useLyricRN';

interface Props {
  track?: Track;
  artist: string;
}

export default ({ track, artist }: Props) => {
  const usedLyric = useLyric(track?.song, artist);
  const {
    hasLrcFromLocal,
    searchAndSetCurrentLyric,
    initTrackLrcLoad,
    lrcOptions,
  } = usedLyric;

  useEffect(() => {
    if (track === undefined || track.title === '') return;
    initTrackLrcLoad();
  }, [track]);

  useEffect(() => {
    const init = async () => {
      if (await hasLrcFromLocal(track?.song)) return;
      searchAndSetCurrentLyric({});
    };
    init();
  }, [lrcOptions]);

  return usedLyric;
};
