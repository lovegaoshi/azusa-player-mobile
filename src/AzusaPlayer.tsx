import React from 'react';
import { usePlaybackListener } from './hooks/usePlayback';

const AzusaPlayer = (props: any) => {
  const playbackListeners = usePlaybackListener();

  return <>{props.children}</>;
};

export default AzusaPlayer;
