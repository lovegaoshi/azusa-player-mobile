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
import { NoxRepeatMode } from './enums/repeatMode';
import { savePlayMode } from '../../utils/ChromeStorage';

const performSkipToNext = () => TrackPlayer.skipToNext();
const performSkipToPrevious = () => TrackPlayer.skipToPrevious();

export const PlayerControls: React.FC = () => {
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const playmode = useNoxSetting(state => state.playerRepeat);
  const setPlayerRepeat = useNoxSetting(state => state.setPlayerRepeat);
  const setPlayMode = (val: string) => {
    setPlayerRepeat(val);
    savePlayMode(val);
  };
  const setCurrentPlayingId = useNoxSetting(state => state.setCurrentPlayingId);

  const playback = usePlaybackState();

  // HACK:  this shouldnt be here, but where?
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], event => {
    if (event.track && event.track.song)
      setCurrentPlayingId(event.track.song.id);
    else setCurrentPlayingId('');
  });

  const onClickPlaymode = () => {
    switch (playmode) {
      case NoxRepeatMode.SHUFFLE:
        setPlayMode(NoxRepeatMode.REPEAT);
        TrackPlayer.setQueueUninterrupted(
          songlistToTracklist(currentPlaylist.songList),
          true
        ).then(() => TrackPlayer.getQueue().then(console.log));
        break;
      case NoxRepeatMode.REPEAT:
        setPlayMode(NoxRepeatMode.REPEAT_TRACK);
        TrackPlayer.setRepeatMode(RepeatMode.Track);
        break;
      case NoxRepeatMode.REPEAT_TRACK:
        setPlayMode(NoxRepeatMode.SHUFFLE);
        TrackPlayer.setRepeatMode(RepeatMode.Queue);
        TrackPlayer.shuffle().then(() =>
          TrackPlayer.getQueue().then(console.log)
        );
        break;
      default:
        break;
    }
  };

  const onThumbsUp = () => console.log('click');

  return (
    <View style={styles.container}>
      {'error' in playback ? (
        <PlaybackError error={playback.error.message} />
      ) : (
        <></>
      )}

      <View style={styles.row}>
        <IconButton
          icon={playmode}
          onPress={onClickPlaymode}
          mode="contained"
          size={30}
          style={{ top: 10 }}
        />
        <IconButton
          icon="skip-previous"
          onPress={performSkipToPrevious}
          mode="contained"
          size={40}
          style={{ top: 5 }}
        />
        <PlayPauseButton state={playback.state} />
        <IconButton
          icon="skip-next"
          onPress={performSkipToNext}
          mode="contained"
          size={40}
          style={{ top: 5 }}
        />
        <IconButton
          icon="thumb-up-outline"
          onPress={onThumbsUp}
          mode="contained"
          size={30}
          style={{ top: 10 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'baseline',
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
});
