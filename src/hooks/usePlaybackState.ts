import {
  usePlaybackState,
  State,
  usePlayWhenReady,
} from 'react-native-track-player';
import { useDebouncedValue } from 'hooks';

const NotLoading = [State.Paused, State.Playing, State.Stopped, State.Ended];

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
