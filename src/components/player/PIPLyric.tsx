import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';

import TrackPlayer, { Track } from 'react-native-track-player';
import { useStore } from 'zustand';

import { useNoxSetting } from '@hooks/useSetting';
import { LyricView } from './Lyric';
import appStore from '@stores/appStore';

const PIPLyricView = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | undefined>(
    undefined
  );
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const PIPMode = useStore(appStore, state => state.pipMode);
  const { height, width } = useWindowDimensions();

  React.useEffect(() => {
    const setLikedStatus = async () => {
      setCurrentTrack(await TrackPlayer.getActiveTrack());
    };
    setLikedStatus();
  }, [currentPlayingId]);

  return PIPMode && currentTrack ? (
    <LyricView
      track={currentTrack}
      artist={'n/a'}
      onLyricPress={() => undefined}
      // HACK: for problems see https://github.com/facebook/react-native/issues/34324
      height={height - 10}
      showUI={false}
      noScrollThrottle={true}
    />
  ) : (
    <></>
  );
};

export default PIPLyricView;
