import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { usePlaybackState } from 'react-native-track-player';

import { PlaybackError } from '@components/player/controls/PlaybackError';
import { PlayPauseButton } from '@components/player/controls/PlayPauseButton';
import { useNoxSetting } from '@stores/useApp';
import ThumbsUpButton from '@components/player/controls/ThumbsUpButton';
import PlayerModeButton from '@components/player/controls/PlayerModeButton';
import usePlayerControls from '@components/player/controls/usePlayerControls';
import LottieButton from '../buttons/LottieButton';

interface Props {
  iconSize?: number;
}
const PlayerControls: React.FC<Props> = ({
  iconSize = (Dimensions.get('window').width - 180) / 5,
}) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  const { performSkipToNext, performSkipToPrevious } = usePlayerControls();
  const playback = usePlaybackState();

  return (
    <View style={styles.container}>
      {'error' in playback ? (
        <PlaybackError error={playback.error.message} />
      ) : (
        <></>
      )}

      <View
        style={[
          styles.row,
          { backgroundColor: playerStyle.customColors.btnBackgroundColor },
        ]}
      >
        <PlayerModeButton iconSize={iconSize} />
        <View style={styles.btnSpacer} />
        <LottieButton
          src={require('@assets/lottie/skip-backwards.json')}
          size={iconSize}
          onPress={performSkipToPrevious}
          strokes={['Line', 'Triange', 'Triange  2']}
        />
        <View style={styles.btnSpacer} />
        <PlayPauseButton iconSize={iconSize} />
        <View style={styles.btnSpacer} />
        <LottieButton
          src={require('@assets/lottie/skip-forwards.json')}
          size={iconSize}
          onPress={performSkipToNext}
          strokes={['Line', 'Triangle 1', 'Triangle 2']}
        />
        <ThumbsUpButton iconSize={iconSize} />
      </View>
    </View>
  );
};

export default PlayerControls;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSpacer: { width: 6 },
});
