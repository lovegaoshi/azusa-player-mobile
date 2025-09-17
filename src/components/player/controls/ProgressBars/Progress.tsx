import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useProgress } from 'react-native-track-player';
import { useDebounce } from 'use-debounce';

import ProgressContainer from './ProgressContainer';
import { useNoxSetting } from '@stores/useApp';
import { seconds2MMSS as formatSeconds } from '@utils/Utils';
import { NativeText as Text } from '@components/commonui/ScaledText';

const ProgressText = () => {
  const { position, duration } = useProgress(1000, false);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const [showDragValue, setShowDragValue] = React.useState(false);
  const miniProgress = useNoxSetting(state => state.miniProgress);
  const miniProgressSliding = useNoxSetting(state => state.miniProgressSliding);
  const [debouncedSliding] = useDebounce(miniProgressSliding, 100);

  const progressTextStyle = [
    styles.labelText,
    {
      color: playerStyle.metaData.darkTheme
        ? 'white'
        : playerStyle.colors.primary,
    },
  ];

  useEffect(() => {
    if (!miniProgressSliding) {
      setShowDragValue(false);
    }
  }, [miniProgressSliding]);

  useEffect(() => {
    if (debouncedSliding) {
      setShowDragValue(true);
    }
  }, [debouncedSliding]);

  return (
    <View style={styles.labelContainer}>
      <Text style={progressTextStyle}>
        {formatSeconds(showDragValue ? miniProgress * duration : position)}
      </Text>
      <Text style={progressTextStyle}>
        {showDragValue
          ? formatSeconds(duration)
          : `-${formatSeconds(Math.max(0, duration - position))}`}
      </Text>
    </View>
  );
};

export const Progress = ({ live }: { live?: boolean }) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const setMiniProgress = useNoxSetting(state => state.setMiniProgress);

  return live ? (
    <View style={styles.liveContainer}>
      <Text style={[styles.liveText, { color: playerStyle.colors.primary }]}>
        Live Stream
      </Text>
    </View>
  ) : (
    <View style={styles.container}>
      <ProgressContainer onValueChange={setMiniProgress} />
      <ProgressText />
    </View>
  );
};

const styles = StyleSheet.create({
  liveContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 28,
  },
  liveText: {
    color: 'white',
    alignSelf: 'center',
    fontSize: 18,
  },
  container: {
    width: '100%',
  },
  progressContainer: {
    width: '100%',
    // for android native bar, set this to 0
    paddingHorizontal: 25,
    marginTop: -22,
  },
  labelContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  labelText: {
    color: 'white',
    fontVariant: ['tabular-nums'],
  },
});
