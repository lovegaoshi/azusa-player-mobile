import { useNoxSetting } from '@hooks/useSetting';
import { logger } from '@utils/Logger';
import { refreshMetadata } from '@utils/mediafetch/resolveURL';

const useUpdatePlaylist = () => {
  const currentPlaylist = useNoxSetting(state => state.currentPlayingList);
  const playlists = useNoxSetting(state => state.playlists);
  const updatePlaylist = useNoxSetting(state => state.updatePlaylist);

  const updateSong = (
    song: NoxMedia.Song,
    newMetadata: Partial<NoxMedia.Song>,
    playlist?: NoxMedia.Playlist
  ) => {
    if (playlist === undefined) {
      playlist = playlists[currentPlaylist.id];
    }
    const songIndex = playlist.songList.findIndex(val => val.id === song.id);
    if (songIndex === -1) {
      logger.warn(`[updateSong] ${song.name} DNE in ${playlist.title}`);
      return;
    }
    return updateSongIndex(songIndex, newMetadata, playlist);
  };

  const updateSongIndex = (
    index: number,
    newMetadata: Partial<NoxMedia.Song>,
    playlist: NoxMedia.Playlist
  ) => {
    const newPlaylist = {
      ...playlist,
      songList: Array.from(playlist.songList),
    };
    newPlaylist.songList[index] = {
      ...newPlaylist.songList[index],
      ...newMetadata,
    };
    updatePlaylist(newPlaylist, [], []);
  };

  const updateSongMetadata = async (
    index: number,
    playlist: NoxMedia.Playlist
  ) => {
    const song = playlist.songList[index];
    const metadata = await refreshMetadata(song);
    updateSongIndex(index, metadata, playlist);
    return metadata;
  };

  return { updateSong, updateSongIndex, updateSongMetadata };
};

export default useUpdatePlaylist;
