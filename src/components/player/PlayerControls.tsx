import React from 'react';
import { StyleSheet, View } from 'react-native';
import TrackPlayer, {
  usePlaybackState,
  useTrackPlayerEvents,
  RepeatMode,
  Event,
} from 'react-native-track-player';
import { IconButton } from 'react-native-paper';

import { PlaybackError } from './PlaybackError';
import { PlayPauseButton } from './PlayPauseButton';
import { useNoxSetting } from '../../hooks/useSetting';
import { songlistToTracklist } from '../../objects/Playlist';
import { NoxRepeatMode } from './enums/RepeatMode';
import { savePlayMode } from '../../utils/ChromeStorage';
import noxPlayingList, { getCurrentTPQueue } from '../../stores/playingList';
import ThumbsUpButton from './ThumbsUpButton';

const { getState, setState } = noxPlayingList;

export const PlayerControls: React.FC = () => {
  const [playModeState, setPlayModeState] = React.useState<string>(
    getState().playmode
  );
  const playerStyle = useNoxSetting(state => state.playerStyle);

  const setPlayMode = (val: string) => {
    setState({ playmode: val });
    setPlayModeState(val);
    savePlayMode(val);
  };
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const setCurrentPlayingId = useNoxSetting(state => state.setCurrentPlayingId);

  const playback = usePlaybackState();

  const onClickPlaymode = () => {
    switch (getState().playmode) {
      case NoxRepeatMode.SHUFFLE:
        setPlayMode(NoxRepeatMode.REPEAT);
        break;
      case NoxRepeatMode.REPEAT:
        setPlayMode(NoxRepeatMode.REPEAT_TRACK);
        TrackPlayer.setRepeatMode(RepeatMode.Track);
        break;
      case NoxRepeatMode.REPEAT_TRACK:
        setPlayMode(NoxRepeatMode.SHUFFLE);
        TrackPlayer.setRepeatMode(RepeatMode.Off);
        break;
      default:
        break;
    }
  };

  const findCurrentPlayIndex = () => {
    return getCurrentTPQueue().findIndex(val => val.id === currentPlayingId);
  };

  const performSkipToNext = async () => {
    if (
      (await TrackPlayer.getActiveTrackIndex()) ===
      (await TrackPlayer.getQueue()).length - 1
    ) {
      const currentTPQueue = getCurrentTPQueue();
      let nextIndex = findCurrentPlayIndex() + 1;
      if (nextIndex > currentTPQueue.length - 1) {
        nextIndex = 0;
      }
      await TrackPlayer.add(songlistToTracklist([currentTPQueue[nextIndex]]));
    }
    TrackPlayer.skipToNext();
    // setTP2Song(getCurrentTPQueue()[nextIndex]);
  };

  const performSkipToPrevious = async () => {
    if ((await TrackPlayer.getActiveTrackIndex()) === 0) {
      const currentTPQueue = getCurrentTPQueue();
      let nextIndex = findCurrentPlayIndex() - 1;
      if (nextIndex < 0) {
        nextIndex = currentTPQueue.length - 1;
      }
      await TrackPlayer.add(
        songlistToTracklist([currentTPQueue[nextIndex]]),
        0
      );
    }
    TrackPlayer.skipToPrevious();
    // setTP2Song(getCurrentTPQueue()[nextIndex]);
  };

  // HACK:  this shouldnt be here? but where?
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], event => {
    if (event.track && event.track.song)
      setCurrentPlayingId(event.track.song.id);
    else setCurrentPlayingId('');
  });

  useTrackPlayerEvents([Event.PlaybackQueueEnded], () => {
    performSkipToNext();
  });

  useTrackPlayerEvents([Event.RemoteNext], () => {
    performSkipToNext();
  });

  useTrackPlayerEvents([Event.RemotePrevious], () => {
    performSkipToPrevious();
  });

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
          {
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <IconButton
          icon={playModeState}
          onPress={onClickPlaymode}
          mode={playerStyle.playerControlIconContained}
          size={30}
          style={{
            backgroundColor: playerStyle.customColors.btnBackgroundColor,
          }}
        />
        <IconButton
          icon="skip-previous"
          onPress={performSkipToPrevious}
          mode={playerStyle.playerControlIconContained}
          size={40}
          style={{
            backgroundColor: playerStyle.customColors.btnBackgroundColor,
          }}
        />
        <PlayPauseButton state={playback.state} />
        <IconButton
          icon="skip-next"
          onPress={performSkipToNext}
          mode={playerStyle.playerControlIconContained}
          size={40}
          style={{
            backgroundColor: playerStyle.customColors.btnBackgroundColor,
          }}
        />
        {ThumbsUpButton()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
});
