import { useNoxSetting } from '@hooks/useSetting';

const useUpdatePlaylist = () => {
  const currentPlaylist = useNoxSetting(state => state.currentPlayingList);
  const playlists = useNoxSetting(state => state.playlists);
  const updatePlaylist = useNoxSetting(state => state.updatePlaylist);

  const updateSong = (song: NoxMedia.Song, playlist?: NoxMedia.Playlist) => {
    if (playlist === undefined) {
      playlist = playlists[currentPlaylist.id];
    }
    const newPlaylist = {
      ...playlist,
      songList: Array.from(playlist.songList),
    };
    newPlaylist.songList[songMenuSongIndexes[0]] = {
      ...newPlaylist.songList[songMenuSongIndexes[0]],
      name: rename,
      parsedName: rename,
    };
    updatePlaylist(newPlaylist, [], []);
  };

  return;
};

export default useUpdatePlaylist;
