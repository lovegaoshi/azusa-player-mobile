import { Track } from 'react-native-track-player';
import { v4 as uuidv4 } from 'uuid';
import { NULL_TRACK } from './Song';
import { PLAYLIST_ENUMS } from '../enums/Playlist';

export const dummyPlaylist = (
  title = 'Search',
  type = PLAYLIST_ENUMS.TYPE_TYPICA_PLAYLIST
): NoxMedia.Playlist => {
  return {
    songList: [],
    title,
    id: uuidv4(),
    subscribeUrl: [],
    blacklistedUrl: [],
    useBiliShazam: false,
    lastSubscribed: 0,
    type,
  };
};

export const dummyPlaylistList = dummyPlaylist();

export const getPlaylistUniqBVIDs = (playlist: NoxMedia.Playlist) => {
  return Array.from(
    playlist.songList.reduce(
      (accumulator, currentValue) => accumulator.add(currentValue.bvid),
      new Set() as Set<string>
    )
  );
};

export const songlistToTracklist = (
  songList: Array<NoxMedia.Song>
): Track[] => {
  return songList.map(song => {
    return {
      ...NULL_TRACK,
      title: song.parsedName,
      artist: song.singer,
      artwork: song.cover,
      duration: song.duration,
      song: song,
    };
  });
};
