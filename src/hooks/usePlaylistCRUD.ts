import { useNoxSetting } from '@stores/useApp';
import { logger } from '@utils/Logger';
import { refreshMetadata } from '../utils/mediafetch/resolveURL';
import useAnalytics from '../utils/Analytics';
import { getPlaylistUniqBVIDs } from '../objects/Playlist';
import {
  fetchVideoInfo,
  songFetch,
  fetchiliBVIDs,
} from '../utils/mediafetch/bilivideo';
import { biliShazamOnSonglist } from '../utils/mediafetch/bilishazam';
import { syncFavlist } from '../utils/Bilibili/bilifavOperate';
import { updateSubscribeFavList } from '../utils/BiliSubscribe';

const usePlaylistCRUD = (mPlaylist?: NoxMedia.Playlist) => {
  const { playlistAnalyze } = useAnalytics();
  const currentPlaylist = useNoxSetting(state => state.currentPlayingList);
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const playlists = useNoxSetting(state => state.playlists);
  const updatePlaylist = useNoxSetting(state => state.updatePlaylist);
  const progressEmitter = useNoxSetting(
    state => state.searchBarProgressEmitter
  );

  const getPlaylist = () => mPlaylist || playlists[currentPlaylist.id];

  const updateSong = (
    song: NoxMedia.Song,
    newMetadata: Partial<NoxMedia.Song>,
    playlist: NoxMedia.Playlist = getPlaylist()
  ) => {
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
    playlist: NoxMedia.Playlist = getPlaylist()
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

  const updateCurrentSongMetadata = async (
    override = false,
    playlist = getPlaylist()
  ) => {
    if (playlist === undefined) return;
    const index = playlist.songList.findIndex(
      song => song.id === currentPlayingId
    );
    const song = playlist.songList[index];
    if (!override && !song.metadataOnLoad) return;
    logger.debug(`[metadata] attempting to udpate ${song.name} metadata:`);
    const metadata = await refreshMetadata(song);
    updateSongIndex(index, metadata, playlist);
    return metadata;
  };

  const playlistCleanup = async (playlist = getPlaylist()) => {
    progressEmitter(100);
    const promises: Promise<void>[] = [];
    const validBVIds: Array<string> = [];
    getPlaylistUniqBVIDs(playlist).forEach(bvid =>
      promises.push(
        fetchVideoInfo(bvid).then(val => {
          if (val) validBVIds.push(val.bvid);
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
  };

  const playlistBiliShazam = async (playlist = getPlaylist()) => {
    progressEmitter(100);
    const newSongList = await biliShazamOnSonglist(
      playlist.songList,
      false,
      progressEmitter
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
    const newSongList = await songFetch({
      videoinfos: await fetchiliBVIDs(
        getPlaylistUniqBVIDs(playlist),
        progressEmitter
      ), // await fetchiliBVID([reExtracted[1]!])
      useBiliTag: playlist.useBiliShazam || false,
    });
    updatePlaylist(
      {
        ...playlist,
        songList: newSongList!,
      },
      [],
      []
    );
  };

  const playlistClear = (playlist = getPlaylist()) =>
    updatePlaylist(
      {
        ...playlist,
        songList: [],
      },
      [],
      []
    );

  const playlistSync2Bilibili = async (playlist = getPlaylist()) => {
    await syncFavlist(playlist, progressEmitter);
    progressEmitter(0);
  };

  const playlistUpdate = (
    v: Partial<NoxMedia.Playlist>,
    playlist = currentPlaylist
  ) => updatePlaylist({ ...playlist, ...v });

  const removeSongs = (
    songs: NoxMedia.Song[],
    banBVID = false,
    playlist = getPlaylist()
  ) => {
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
    Object.values(playlists).forEach(playlist =>
      removeSongs(songs, banBVID, playlist)
    );

  const rssUpdate = (subscribeUrls?: string[], playlist = getPlaylist()) =>
    updateSubscribeFavList({
      playlist,
      subscribeUrls,
      progressEmitter,
      updatePlaylist,
    });
  // TODO: i dont think this is how it works
  const reloadBVid = (songs: NoxMedia.Song[], playlist = getPlaylist()) => {
    const bvids = Array.from(new Set(songs.map(song => song.bvid)));
    const newPlaylist: NoxMedia.Playlist = {
      ...playlist,
      songList: playlist.songList.filter(song => !bvids.includes(song.bvid)),
    };
    rssUpdate(undefined, newPlaylist);
  };

  return {
    updateSong,
    updateSongIndex,
    updateSongMetadata,
    updateCurrentSongMetadata,
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
  };
};

export default usePlaylistCRUD;
