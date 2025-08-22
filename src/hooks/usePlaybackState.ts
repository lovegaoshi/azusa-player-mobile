import {
  usePlaybackState,
  State,
  usePlayWhenReady,
} from 'react-native-track-player';
import { useDebouncedValue } from 'hooks';
import { useEffect } from 'react';

import { setLastPlaybackStatus } from '@utils/ChromeStorage';

const NotLoading = [State.Paused, State.Playing, State.Stopped, State.Ended];

export const usePlaybackStateLogging = () => {
  const playback = usePlaybackState();
  useEffect(() => {
    setLastPlaybackStatus(playback.state ?? 'unknown');
  }, [playback.state]);
  return playback;
};

export default () => {
  const playback = usePlaybackState();
  const playWhenReady = usePlayWhenReady();
  const isLoading = useDebouncedValue(
    !NotLoading.includes(playback.state!),
    250,
  );
  const isErrored = playback.state === State.Error;
  const isEnded = playback.state === State.Ended;
  const showPause = playWhenReady && !(isErrored || isEnded);
  const showBuffering = isErrored || (playWhenReady && isLoading);

  return {
    isLoading,
    isErrored,
    isEnded,
    showPause,
    showBuffering,
    playback,
  };
};
