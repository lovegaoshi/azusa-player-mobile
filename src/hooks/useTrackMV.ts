// helper hook that gets only the MV from activeTrack

import { RefObject, useEffect, useState } from 'react';
import { VideoRef } from 'react-native-video';
import TrackPlayer from 'react-native-track-player';
import { AppState } from 'react-native';

import { useTrackStore } from '@hooks/useActiveTrack';
import useRNTPObserverStore from '@stores/RNObserverStore';
import { useLazyEffect } from '@utils/useLazyEffect';
import { execWhenTrue } from '@utils/Utils';

export default (videoRef: RefObject<VideoRef | null>) => {
  const track = useTrackStore(s => s.track);
  const [parsedMV, setParsedMV] = useState<
    NoxTheme.BackgroundImage | undefined
  >();
  const RNTPPlay = useRNTPObserverStore(s => s.RNTPPlay);
  const RNTPSeek = useRNTPObserverStore(s => s.RNTPSeek);
  const song = track?.song as NoxMedia.Song;

  const primeVideoPosition = async () => {
    if (!parsedMV || !song?.MVsync) {
      return;
    }
    const { position } = await TrackPlayer.getProgress();
    videoRef.current?.seek(position);
  };

  useLazyEffect(() => {
    execWhenTrue({
      loopCheck: async () => videoRef.current !== null,
      executeFn: primeVideoPosition,
    });
  }, [RNTPPlay, RNTPSeek]);

  useEffect(() => {
    try {
      setParsedMV(JSON.parse(song?.backgroundOverride ?? ''));
    } catch {
      setParsedMV(undefined);
      // setParsedMV({ type: RESOLVE_TYPE.bvid, identifier: 'BV1Ei4y1b78A' });
    }
  }, [song]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      nextAppState === 'active' && primeVideoPosition();
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return parsedMV;
};
