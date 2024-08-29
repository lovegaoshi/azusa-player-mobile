import { useNoxSetting } from '@stores/useApp';
import { logger } from '@utils/Logger';
import { removeSongBiliShazamed } from '../objects/Song';
import { refreshMetadata } from '../utils/mediafetch/resolveURL';
import playlistAnalyze from '../utils/Analytics';
import { getPlaylistUniqBVIDs } from '../objects/Playlist';
import { fetchBiliBVIDs } from '../utils/mediafetch/bilivideo';
import { biliShazamOnSonglist } from '../utils/mediafetch/bilishazam';
import { syncFavlist } from '@utils/Bilibili/bilifavOperate';
import { updateSubscribeFavList } from '../utils/BiliSubscribe';
import { sortPlaylist as _sortPlaylist } from '../utils/playlistOperations';
import { SortOptions } from '../enums/Playlist';

const usePlaylistCRUD = (mPlaylist?: NoxMedia.Playlist) => {
  const currentPlaylist = useNoxSetting(state => state.currentPlayingList);
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const playlistIds = useNoxSetting(state => state.playlistIds);
  const updatePlaylist = useNoxSetting(state => state.updatePlaylist);
  const _getPlaylist = useNoxSetting(state => state.getPlaylist);
  const progressEmitter = useNoxSetting(
    state => state.searchBarProgressEmitter
  );

  const getPlaylist = () =>
    _getPlaylist(mPlaylist?.id ?? currentPlaylist?.id ?? '');

  const updateSong = async (
    song: NoxMedia.Song,
    newMetadata: Partial<NoxMedia.Song>,
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist()
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
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist()
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
    playlist: NoxMedia.Playlist
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
      song => song.id === currentPlayingId
    );
    logger.debug(
      `[updateSongMetadataReceived] @ ${index}/${playlist.title}: ${JSON.stringify(metadata)} `
    );
    if (index < 0) return;
    updateSongIndex(index, metadata, playlist);
    return metadata;
  };

  const getCurrentSong = async (
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist()
  ) => {
    playlist = await playlist;
    if (playlist === undefined) return;
    const index = playlist.songList.findIndex(
      song => song.id === currentPlayingId
    );
    return {
      song: playlist.songList[index],
      index,
      playlist,
    };
  };

  const updateCurrentSongMetadata = async (
    override = false,
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist()
  ) => {
    const result = await getCurrentSong(playlist);
    if (result === undefined) return;
    const { index, song } = result;
    if (!override && !song?.metadataOnLoad) return;
    logger.debug(`[metadata] attempting to udpate ${song.name} metadata:`);
    return updateSongMetadata(index, result.playlist);
  };

  const playlistCleanup = async (
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist()
  ) => {
    playlist = await playlist;
    progressEmitter(100);
    const promises: Promise<void>[] = [];
    const validBVIds: string[] = [];
    const uniqBVIds = getPlaylistUniqBVIDs(playlist);
    uniqBVIds.forEach(bvid =>
      promises.push(
        fetchBiliBVIDs([bvid]).then(val => {
          if (val.length > 0) validBVIds.push(bvid);
        })
      )
    );
    await Promise.all(promises);
    updatePlaylist(
      {
        ...playlist,
        songList: playlist.songList.filter(song =>
          validBVIds.includes(song.bvid)
        ),
      },
      [],
      []
    );
    progressEmitter(0);
    return uniqBVIds.length - validBVIds.length;
  };

  const playlistBiliShazam = async (
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist()
  ) => {
    playlist = await playlist;
    progressEmitter(100);
    const newSongList = await biliShazamOnSonglist(
      playlist.songList,
      false,
      progressEmitter,
      true
    );
    updatePlaylist(
      {
        ...playlist,
        songList: newSongList,
      },
      [],
      []
    );
    progressEmitter(0);
  };

  const playlistReload = async (playlist = currentPlaylist) => {
    const newSongList = await fetchBiliBVIDs(
      getPlaylistUniqBVIDs(playlist),
      progressEmitter,
      playlist.useBiliShazam ?? false
    );
    updatePlaylist(
      {
        ...playlist,
        songList: newSongList!,
      },
      [],
      []
    );
  };

  const playlistClear = async (
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist()
  ) =>
    updatePlaylist(
      {
        ...(await playlist),
        songList: [],
      },
      [],
      []
    );

  const playlistSync2Bilibili = async (
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist()
  ) => {
    await syncFavlist(await playlist, progressEmitter);
    progressEmitter(0);
  };

  const playlistUpdate = (
    v: Partial<NoxMedia.Playlist>,
    playlist = currentPlaylist
  ) => updatePlaylist({ ...playlist, ...v });

  const removeSongs = async (
    songs: NoxMedia.Song[],
    banBVID = false,
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist()
  ) => {
    playlist = await playlist;
    const newPlaylist = banBVID
      ? {
          ...playlist,
          blacklistedUrl: playlist.blacklistedUrl.concat(
            songs.map(song => song.bvid)
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
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist()
  ) =>
    updateSubscribeFavList({
      playlist: await playlist,
      subscribeUrls,
      progressEmitter,
      updatePlaylist,
    });

  // TODO: i dont think this is how it works
  const reloadBVid = async (
    songs: NoxMedia.Song[],
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist()
  ) => {
    playlist = await playlist;
    const bvids = Array.from(new Set(songs.map(song => song.bvid)));
    const newPlaylist: NoxMedia.Playlist = {
      ...playlist,
      songList: playlist.songList.filter(song => !bvids.includes(song.bvid)),
    };
    const newSongList = await fetchBiliBVIDs(
      getPlaylistUniqBVIDs(playlist),
      progressEmitter,
      playlist.useBiliShazam ?? false
    );
    updatePlaylist(newPlaylist, newSongList);
  };

  const playlistRemoveBiliShazamed = async (
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist()
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
    playlist: NoxMedia.Playlist | Promise<NoxMedia.Playlist> = getPlaylist()
  ) => {
    updatePlaylist(_sortPlaylist(await playlist, sort, ascend));
  };

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
    reloadBVid,
    playlistRemoveBiliShazamed,
    sortPlaylist,
  };
};

export default usePlaylistCRUD;
