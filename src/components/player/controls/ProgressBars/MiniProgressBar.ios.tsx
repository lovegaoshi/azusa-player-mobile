import React from 'react';
import { useProgress } from 'react-native-track-player';
import { ProgressBar as PaperProgressBar } from 'react-native-paper';

import { ProgressBarProps } from './ProgressBarProps';
import { styles } from './ProgressBar';

/**
 * rn-paper progress bar; @rn-assets/slider shows artifacts in iOS
 * used spefifically for the miniplayer
 */
const SimpleProgressBar = ({
  progressInterval,
  trackHeight,
}: ProgressBarProps) => {
  const { position, duration } = useProgress(progressInterval, false);

  return (
    <PaperProgressBar
      progress={position / duration}
      style={[{ height: trackHeight }, styles.transparent]}
    />
  );
};
export default SimpleProgressBar;
