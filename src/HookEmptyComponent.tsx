import { usePlaybackStateLogging } from '@hooks/usePlaybackState';

/**
 * an empty component hosts persisting hooks that shouldnt affect component rerendering.
 * loaded directly inside App.tsx
 */
export default () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const usedPlaybackStateLogging = usePlaybackStateLogging();
  return <></>;
};
