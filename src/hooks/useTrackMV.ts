// helper hook that gets only the MV from activeTrack

import { RefObject, useEffect, useState } from 'react';
import { VideoRef } from 'react-native-video';

import { useTrackStore } from '@hooks/useActiveTrack';

export default (videoRef: RefObject<VideoRef | null>) => {
  const track = useTrackStore(s => s.track);
  const [parsedMV, setParsedMV] = useState<
    NoxTheme.BackgroundImage | undefined
  >();
  const song = track?.song as NoxMedia.Song;
  useEffect(() => {
    try {
      setParsedMV(JSON.parse(song?.backgroundOverride ?? ''));
    } catch {
      setParsedMV(undefined);
      // setParsedMV({ type: RESOLVE_TYPE.bvid, identifier: 'BV1Ei4y1b78A' });
    }
  }, [song]);

  return parsedMV;
};
