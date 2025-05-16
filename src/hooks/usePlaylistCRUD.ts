import { useNoxSetting } from '@stores/useApp';
import { logger } from '@utils/Logger';
import { removeSongBiliShazamed } from '../objects/Song';
import { refreshMetadata } from '../utils/mediafetch/resolveURL';
import playlistAnalyze from '../utils/Analytics';
import { biliShazamOnSonglist } from '../utils/mediafetch/bilishazam';
import { syncFavlist } from '@utils/Bilibili/bilifavOperate';
import { updateSubscribeFavList } from '../utils/BiliSubscribe';
import { sortPlaylist as _sortPlaylist } from '../utils/playlistOperations';
import { SortOptions } from '../enums/Playlist';
import { resolveUrl } from '@utils/SongOperations';

const usePlaylistCRUD = (mPlaylist?: NoxMedia.Playlist) => {
  const currentPlaylist = useNoxSetting(state => state.currentPlayingList);
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const playlistIds = useNoxSetting(state => state.playlistIds);
  const updatePlaylist = useNoxSetting(state => state.updatePlaylist);
  const _getPlaylist = useNoxSetting(state => state.getPlaylist);
  const progressEmitter = useNoxSetting(
    state => state.searchBarProgressEmitter,
  );

  const getPlaylist = () =>
    _getPlaylist(mPlaylist?.id ?? currentPlaylist?.id ?? '');

  const updateSong = async (
    song: NoxMedia.Song,
    newMetadata: Partial<NoxMedia.Song>,
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist(),
  ) => {
    playlist = await playlist;
    const songIndex = playlist.songList.findIndex(val => val.id === song.id);
    if (songIndex === -1) {
      logger.warn(`[updateSong] ${song.name} DNE in ${playlist.title}`);
      return;
    }
    return updateSongIndex(songIndex, newMetadata, playlist);
  };

  const updateSongIndex = async (
    index: number,
    newMetadata: Partial<NoxMedia.Song>,
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist(),
  ) => {
    playlist = await playlist;
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
    playlist: NoxMedia.Playlist,
  ) => {
    const song = playlist.songList[index];
    const metadata = await refreshMetadata(song);
    updateSongIndex(index, metadata, playlist);
    return metadata;
  };

  const updateCurrentSongMetadataReceived = async ({
    playlist = getPlaylist(),
    metadata = {},
  }: {
    playlist?: NoxMedia.Playlist | Promise<NoxMedia.Playlist>;
    metadata?: Partial<NoxMedia.Song>;
  }) => {
    playlist = await playlist;
    const index = playlist.songList.findIndex(
      song => song.id === currentPlayingId,
    );
    logger.debug(
      `[updateSongMetadataReceived] @ ${index}/${playlist.title}: ${JSON.stringify(metadata)} `,
    );
    if (index < 0) return;
    updateSongIndex(index, metadata, playlist);
    return metadata;
  };

  const getCurrentSong = async (
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist(),
  ) => {
    playlist = await playlist;
    if (playlist === undefined) return;
    const index = playlist.songList.findIndex(
      song => song.id === currentPlayingId,
    );
    return {
      song: playlist.songList[index],
      index,
      playlist,
    };
  };

  const updateCurrentSongMetadata = async (
    override = false,
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist(),
  ) => {
    const result = await getCurrentSong(playlist);
    if (result === undefined) return;
    const { index, song } = result;
    if (!override && !song?.metadataOnLoad) return;
    logger.debug(`[metadata] attempting to udpate ${song.name} metadata:`);
    return updateSongMetadata(index, result.playlist);
  };

  const playlistCleanup = async (
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist(),
  ) => {
    playlist = await playlist;
    progressEmitter(100);

    const invalidSongs: NoxMedia.Song[] = [];
    for (const song of playlist.songList) {
      try {
        const resolvedURL = await resolveUrl({ song });
        if (resolvedURL.url.length < 1) {
          throw new Error('cannot resolve song');
        }
      } catch {
        invalidSongs.push(song);
      }
    }
    updatePlaylist(
      {
        ...playlist,
        songList: playlist.songList.filter(
          song => !invalidSongs.includes(song),
        ),
      },
      [],
      [],
    );
    progressEmitter(0);
    return invalidSongs.length;
  };

  const playlistBiliShazam = async (
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist(),
  ) => {
    playlist = await playlist;
    progressEmitter(100);
    const newSongList = await biliShazamOnSonglist(
      playlist.songList,
      false,
      progressEmitter,
      true,
    );
    updatePlaylist(
      {
        ...playlist,
        songList: newSongList,
      },
      [],
      [],
    );
    progressEmitter(0);
  };

  const playlistReload = async (playlist = currentPlaylist) => {
    const newSongList: NoxMedia.Song[] = [];
    for (const song of playlist.songList) {
      newSongList.push({ ...song, ...(await refreshMetadata(song)) });
    }
    updatePlaylist(
      {
        ...playlist,
        songList: newSongList!,
      },
      [],
      [],
    );
  };

  const playlistClear = async (
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist(),
  ) =>
    updatePlaylist(
      {
        ...(await playlist),
        songList: [],
      },
      [],
      [],
    );

  const playlistSync2Bilibili = async (
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist(),
  ) => {
    await syncFavlist(await playlist, progressEmitter);
    progressEmitter(0);
  };

  const playlistUpdate = (
    v: Partial<NoxMedia.Playlist>,
    playlist = currentPlaylist,
  ) => updatePlaylist({ ...playlist, ...v });

  const removeSongs = async (
    songs: NoxMedia.Song[],
    banBVID = false,
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist(),
  ) => {
    playlist = await playlist;
    const newPlaylist = banBVID
      ? {
          ...playlist,
          blacklistedUrl: playlist.blacklistedUrl.concat(
            songs.map(song => song.bvid),
          ),
        }
      : playlist;
    updatePlaylist(newPlaylist, [], songs);
    return newPlaylist;
  };

  const removeSongsFromAllLists = (songs: NoxMedia.Song[], banBVID = false) =>
    playlistIds
      .map(v => _getPlaylist(v))
      .forEach(playlist => removeSongs(songs, banBVID, playlist));

  const rssUpdate = async (
    subscribeUrls?: string[],
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist(),
  ) =>
    updateSubscribeFavList({
      playlist: await playlist,
      subscribeUrls,
      progressEmitter,
      updatePlaylist,
    });

  const playlistRemoveBiliShazamed = async (
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist(),
  ) => {
    playlist = await playlist;
    updatePlaylist({
      ...playlist,
      songList: playlist.songList.map(song => removeSongBiliShazamed(song)),
    });
  };

  const sortPlaylist = async (
    sort = SortOptions.PreviousOrder,
    ascend = false,
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist(),
  ) => {
    updatePlaylist(await _sortPlaylist(await playlist, sort, ascend));
  };

  const findSongIndex = (song?: NoxMedia.Song) =>
    song ? currentPlaylist.songList.findIndex(v => v.id === song.id) : -1;

  const findSong = (song?: NoxMedia.Song): NoxMedia.Song =>
    currentPlaylist.songList[findSongIndex(song)];

  return {
    updateSong,
    updateSongIndex,
    updateSongMetadata,
    updateCurrentSongMetadata,
    updateCurrentSongMetadataReceived,
    playlistAnalyze,
    playlistCleanup,
    playlistBiliShazam,
    playlistReload,
    playlistClear,
    playlistSync2Bilibili,
    playlistUpdate,
    removeSongs,
    removeSongsFromAllLists,
    rssUpdate,
    playlistRemoveBiliShazamed,
    sortPlaylist,
    findSongIndex,
    findSong,
  };
};

export default usePlaylistCRUD;
