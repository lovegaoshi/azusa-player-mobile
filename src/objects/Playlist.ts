import { Track } from 'react-native-track-player';
import { v4 as uuidv4 } from 'uuid';
import Song from './SongInterface';
import { NULL_TRACK } from './SongOperations';
import { PLAYLIST_ENUMS } from '../enums/Playlist';

export default interface Playlist {
  songList: Array<Song>;
  title: string;
  id: string;
  subscribeUrl: Array<string>;
  blacklistedUrl: Array<string>;
  useBiliShazam: boolean;
  lastSubscribed: number;
  type: string;
}

export const dummyPlaylist = (
  title = 'Search',
  type = PLAYLIST_ENUMS.TYPE_TYPICA_PLAYLIST
): Playlist => {
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

export const getPlaylistUniqBVIDs = (playlist: Playlist) => {
  return Array.from(
    playlist.songList.reduce(
      (accumulator, currentValue) => accumulator.add(currentValue.bvid),
      new Set() as Set<string>
    )
  );
};

export const songlistToTracklist = (
  songList: Array<Song>,
  resolveIndex = -1
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
