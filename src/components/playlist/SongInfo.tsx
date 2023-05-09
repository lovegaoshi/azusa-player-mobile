import * as React from 'react';
import { Checkbox, IconButton, Text } from 'react-native-paper';
import { View, Pressable, GestureResponderEvent } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import { useNoxSetting } from '../../hooks/useSetting';
import { styles } from '../style';
import Song from '../../objects/SongInterface';
import { seconds2MMSS } from '../../utils/Utils';
import { playlistToTracklist } from '../../objects/Playlist';
import { NoxRepeatMode } from '../player/enums/repeatMode';

function SongInfo({
  item,
  index,
  currentPlaying,
  checking = false,
  checkedProp = false,
  onChecked = () => void 0,
}: {
  item: Song;
  index: number;
  currentPlaying: boolean;
  checking?: boolean;
  checkedProp?: boolean;
  onChecked?: () => void;
}) {
  const [title, id, artist] = [item.parsedName, item.id, item.singer];
  const setCurrentPlayingId = useNoxSetting(state => state.setCurrentPlayingId);
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);
  const setCurrentPlayingList = useNoxSetting(
    state => state.setCurrentPlayingList
  );
  const playmode = useNoxSetting(state => state.playerRepeat); // performance drain?
  const setSongMenuCoords = useNoxSetting(state => state.setSongMenuCoords);
  const setSongMenuVisible = useNoxSetting(state => state.setSongMenuVisible);
  const setSongMenuSongIndexes = useNoxSetting(
    state => state.setSongMenuSongIndexes
  );
  const [checked, setChecked] = React.useState(false);

  // TODO: useCallback? [currentPlaylist, currentPlayingList, playMode, index]
  // TODO: can i somehow shove most of these into an async promise, then
  // use a boolean flag to make a loading screen?
  const playSong = async () => {
    const reloadPlaylistAndPlay = () => {
      let tracks = playlistToTracklist(currentPlaylist, index);
      if (playmode === NoxRepeatMode.SHUFFLE) {
        const currentTrack = tracks[index];
        tracks = [...tracks].sort(() => Math.random() - 0.5);
        TrackPlayer.setQueue(tracks).then(() => {
          TrackPlayer.skip(tracks.indexOf(currentTrack)).then(() =>
            TrackPlayer.play()
          );
        });
      } else {
        TrackPlayer.setQueue(tracks).then(() => {
          TrackPlayer.skip(index).then(() => TrackPlayer.play());
        });
      }
    };

    setCurrentPlayingId(id);
    if (currentPlaylist.id !== currentPlayingList) {
      setCurrentPlayingList(currentPlaylist.id);
      reloadPlaylistAndPlay();
    } else {
      TrackPlayer.getQueue().then(tracks => {
        const trackIndex = tracks.findIndex(track => track.song.id === id);
        if (trackIndex === -1) {
          reloadPlaylistAndPlay();
        } else {
          TrackPlayer.skip(trackIndex).then(() => TrackPlayer.play());
        }
      });
    }
    /**
       * ugly code testing out uninterrupted playlist queue change:
      TrackPlayer.getActiveTrackIndex().then(activeTrackIndex => {
        TrackPlayer.getQueue().then(queue => {
          const activeTrack = queue[activeTrackIndex!];
          let removeTrackIndex = [...Array(queue.length).keys()];
          removeTrackIndex.splice(activeTrackIndex!, 1);
          console.debug(removeTrackIndex, queue, activeTrack, activeTrackIndex!);
          TrackPlayer.remove(removeTrackIndex).then(() => {
            TrackPlayer.getQueue().then(newQueue =>
              console.log('newQueue b4 insert', newQueue)
            );
            TrackPlayer.add(trackList).then(() => {
              TrackPlayer.getQueue().then(newQueue =>
                console.log('newQueue ', newQueue)
              );
            });
          });
        });
      });
      return;
       */
  };

  const toggleCheck = () => {
    setChecked(val => !val);
    onChecked();
  };

  const getSongIndex = () => {
    // HACK: :index is no longer reliable because currentRow may filter view.
    // either make filtered view a global state, or do this every time.
    // which I dont think its terribly bad?
    return currentPlaylist.songList.findIndex(song => song.id === id);
  };

  React.useEffect(() => {
    if (checked !== checkedProp) {
      setChecked(checkedProp);
    }
  }, [checkedProp]);

  return (
    <View
      style={{
        paddingTop: 5,
        paddingBottom: 5,
        flexDirection: 'row',
        backgroundColor: currentPlaying ? 'lightgrey' : 'white',
      }}
    >
      {checking && (
        <View style={{ flex: 1 }}>
          <Checkbox
            status={checked ? 'checked' : 'unchecked'}
            onPress={toggleCheck}
          />
        </View>
      )}
      <View style={{ flex: 4.9 }}>
        <Pressable onPress={checking ? toggleCheck : playSong}>
          <Text variant="titleMedium">{`${String(index + 1)}. ${title}`}</Text>
          <Text variant="titleSmall" style={{ color: 'grey' }}>
            {artist}
          </Text>
        </Pressable>
      </View>
      <View
        style={{
          flex: 2,
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}
      >
        <Text variant="titleSmall" style={{ top: 13 }}>
          {seconds2MMSS(item.duration)}
        </Text>
        <IconButton
          icon="dots-vertical"
          onPress={(event: GestureResponderEvent) => {
            if (!checking) {
              setSongMenuSongIndexes([getSongIndex()]);
            }
            setSongMenuVisible(true);
            setSongMenuCoords({
              x: event.nativeEvent.pageX,
              y: event.nativeEvent.pageY,
            });
          }}
          size={20}
        />
      </View>
    </View>
  );
}
export default React.memo(SongInfo);
