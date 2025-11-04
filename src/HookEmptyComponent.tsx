import { usePlaybackStateLogging } from '@hooks/usePlaybackState';

import usePlaybackAA from '@hooks/usePlaybackAA';
/**
 * an empty component hosts persisting hooks that shouldnt affect component rerendering.
 * loaded directly inside App.tsx
 */
export default function HookEmptyComponent() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const usedPlaybackStateLogging = usePlaybackStateLogging();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = usePlaybackAA();
  return <></>;
}
