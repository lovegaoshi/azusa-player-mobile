import React from 'react';
import { Image, StyleSheet, Text, View, Dimensions } from 'react-native';
import type { Track } from 'react-native-track-player';
import TrackPlayer from 'react-native-track-player';
import { useNoxSetting } from '../../hooks/useSetting';

export const TrackInfo: React.FC<{
  track?: Track;
}> = ({ track }) => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);
  const playlists = useNoxSetting(state => state.playlists);
  const [currentTPQueue, setCurrentTPQueue] = React.useState<Track[]>([]);

  React.useEffect(() => {
    // TODO: when the sliding window queue is implemented, this would just be
    // another zustand state.
    TrackPlayer.getQueue().then(setCurrentTPQueue);
  }, [currentPlayingList]);

  return (
    <View style={styles.container}>
      {playerSetting.hideCoverInMobile ? (
        <></>
      ) : (
        <Image style={styles.artwork} source={{ uri: `${track?.artwork}` }} />
      )}
      <Text style={styles.titleText}>{track?.title}</Text>
      <Text style={styles.artistText}>{track?.artist}</Text>
      <Text style={styles.artistText}>
        {currentPlayingList ? playlists[currentPlayingList]?.title : ''}
      </Text>
      <Text style={styles.artistText}>
        {currentPlayingList && playlists[currentPlayingList] && track?.song
          ? `#${
              playlists[currentPlayingList].songList.findIndex(
                song => song.id === track.song.id
              ) + 1
            } - ${
              currentTPQueue.findIndex(
                song => song?.song?.id === track.song.id
              ) + 1
            }/${currentTPQueue.length}`
          : ''}
      </Text>
    </View>
  );
};

const albumArtSize = Math.min(
  Dimensions.get('window').width,
  Dimensions.get('window').height
);
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  artwork: {
    width: albumArtSize,
    height: albumArtSize,
    marginTop: 15,
    backgroundColor: 'grey',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'grey',
    marginTop: 15,
  },
  artistText: {
    fontSize: 16,
    fontWeight: '200',
    color: 'grey',
  },
});
