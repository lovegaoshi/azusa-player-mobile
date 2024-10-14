// migrating usePlayback to a non hook version.
import TrackPlayer, { RepeatMode } from 'react-native-track-player';
import i18n from 'i18next';

import { useNoxSetting } from '@stores/useApp';
import { randomChoice } from '../utils/Utils';
import logger from '../utils/Logger';
import {
  clearPlaylistUninterrupted,
  playSongUninterrupted,
  playSongInterrupted,
} from '@utils/RNTPUtils';
import { NoxRepeatMode } from '@enums/RepeatMode';
import noxPlayingList, { setPlayingIndex } from '@stores/playingList';
import { dataSaverPlaylist, dataSaverSongs } from '@utils/Cache';
import { PLAYLIST_MEDIAID, PlaylistTypes } from '@enums/Playlist';
import { fetchCurrentMusicTop } from '@utils/mediafetch/biliMusicTop';

const { getState } = noxPlayingList;

const dataSaverPlaylistWrapper = (datasave = true) => {
  return datasave
    ? dataSaverPlaylist
    : (playlist: NoxMedia.Playlist) => playlist;
};

export interface PlayFromPlaylist {
  playlist: NoxMedia.Playlist;
  song?: NoxMedia.Song;
  interruption?: boolean;
  playlistParser?: (playlist: NoxMedia.Playlist) => NoxMedia.Playlist;
}

interface _PlayFromPlaylist extends PlayFromPlaylist {
  setCurrentPlayingList: (v: NoxMedia.Playlist) => void;
  setCurrentPlayingId: (v: string) => void;
  currentPlayingId: string | null;
}

export const _playFromPlaylist = async ({
  playlist,
  song,
  interruption = false,
  playlistParser = dataSaverPlaylistWrapper(false),
  setCurrentPlayingList,
  setCurrentPlayingId,
  currentPlayingId,
}: _PlayFromPlaylist) => {
  playlist = playlistParser(playlist);
  setCurrentPlayingList(playlist);
  if (getState().playmode === NoxRepeatMode.RepeatTrack) {
    await TrackPlayer.setRepeatMode(RepeatMode.Off);
  }
  if (song === undefined) {
    if (playlist.songList.length === 0) {
      // no song exists.
      logger.warn(`[Playback] ${playlist.id} is empty.`);
      return TrackPlayer.reset();
    } else {
      song = randomChoice(playlist.songList);
    }
  }
  setPlayingIndex(0, song.id);
  // HACK: track?.song? is somehow updated already here
  // TODO: fix this
  setCurrentPlayingId(song.id);
  logger.debug(
    `[playFromPlaylist]: ${currentPlayingId} vs ${song.id} from ${playlist.id}`
  );
  if (interruption) {
    return playSongInterrupted(song);
  }
  if (currentPlayingId !== song.id) {
    await playSongUninterrupted(song);
  }
  // HACK: WHY?
  return clearPlaylistUninterrupted().then(TrackPlayer.play);
};

const playFromPlaylist = async (args: PlayFromPlaylist) => {
  const appState = useNoxSetting.getState();
  return _playFromPlaylist({
    ...args,
    setCurrentPlayingId: appState.setCurrentPlayingId,
    currentPlayingId: appState.currentPlayingId,
    setCurrentPlayingList: appState.setCurrentPlayingList,
  });
};

export interface PlayFromMediaID {
  mediaId: string;
  playlists: { [key: string]: NoxMedia.Playlist };
  currentPlayingList: NoxMedia.Playlist;
  getPlaylist: (key: string) => Promise<NoxMedia.Playlist>;
  isDataSaving: boolean;
  playlistIds: string[];
}
export const _playFromMediaId = async ({
  mediaId,
  playlists,
  currentPlayingList,
  getPlaylist,
  isDataSaving,
  playlistIds,
}: PlayFromMediaID) => {
  logger.info(`[playFromMediaId]: ${mediaId}`);
  if (mediaId.startsWith(PLAYLIST_MEDIAID)) {
    mediaId = mediaId.substring(PLAYLIST_MEDIAID.length);
    // play a playlist.
    if (playlists[mediaId] === undefined) {
      logger.warn(`[Playback] ${mediaId} doesnt exist.`);
      return;
    }
    return playFromPlaylist({
      playlist: await getPlaylist(mediaId),
      playlistParser: dataSaverPlaylistWrapper(isDataSaving),
    });
  } else {
    // mediaId should follow the format of ${NoxMedia.Song.bvid}|${NoxMedia.Song.id}
    const regexMatch = /([^|]+)\|([^|]+)/.exec(mediaId);
    if (regexMatch === null) {
      logger.warn(`[playFromMediaId]: ${mediaId} is not valid.`);
      return;
    }
    const [, songBVID, songCID] = regexMatch;
    for (const song of currentPlayingList.songList) {
      if (song.bvid === songBVID && song.id === songCID) {
        return playFromPlaylist({
          playlist: currentPlayingList,
          song,
          playlistParser: dataSaverPlaylistWrapper(isDataSaving),
        });
      }
    }
    for (const playlistId of playlistIds) {
      const playlist = await getPlaylist(playlistId);
      for (const song of playlist.songList) {
        if (song.bvid === songBVID && song.id === songCID) {
          return playFromPlaylist({
            playlist,
            song,
            playlistParser: dataSaverPlaylistWrapper(isDataSaving),
          });
        }
      }
    }
    logger.warn(`[playFromMediaId]: ${mediaId} does not exist.`);
  }
};

export const playFromMediaId = async (
  mediaId: string,
  isDataSaving = false
) => {
  const appState = useNoxSetting.getState();
  return _playFromMediaId({
    mediaId,
    playlists: appState.playlists,
    currentPlayingList: appState.currentPlayingList,
    getPlaylist: appState.getPlaylist,
    isDataSaving,
    playlistIds: appState.playlistIds,
  });
};

export interface PlayAsSearchList {
  songs: NoxMedia.Song[];
  playlistSongs?: NoxMedia.Song[];
  title?: string;
  song?: NoxMedia.Song;
}

interface _PlayAsSearchList extends PlayAsSearchList {
  searchPlaylist: NoxMedia.Playlist;
  setSearchPlaylist: (searchPlaylist: NoxMedia.Playlist) => void;
  setCurrentPlaylist: (playlist: NoxMedia.Playlist) => void;
}

export const _playAsSearchList = async ({
  songs,
  playlistSongs,
  title = i18n.t('PlaylistsDrawer.SearchListTitle'),
  song,
  searchPlaylist,
  setSearchPlaylist,
  setCurrentPlaylist,
}: _PlayAsSearchList) => {
  const newPlayingPlaylist = {
    ...searchPlaylist,
    title,
    songList: songs,
  };
  const newSearchPlaylist = playlistSongs
    ? { ...newPlayingPlaylist, songList: playlistSongs }
    : newPlayingPlaylist;
  setSearchPlaylist(newSearchPlaylist);
  await playFromPlaylist({ playlist: newPlayingPlaylist, song });
  setCurrentPlaylist(newSearchPlaylist);
};

export const playAsSearchList = async (args: PlayAsSearchList) => {
  const appState = useNoxSetting.getState();
  return _playAsSearchList({
    ...args,
    searchPlaylist: appState.searchPlaylist,
    setSearchPlaylist: appState.setSearchPlaylist,
    setCurrentPlaylist: appState.setCurrentPlaylist,
  });
};

interface ShuffleAll {
  playlists: { [key: string]: NoxMedia.Playlist };
  getPlaylist: (key: string) => Promise<NoxMedia.Playlist>;
  isDataSaving: boolean;
}
export const _shuffleAll = async ({
  playlists,
  getPlaylist,
  isDataSaving,
}: ShuffleAll) => {
  const allPlaylists = await Promise.all(
    Object.values(playlists)
      .filter(playlist => playlist.type === PlaylistTypes.Typical)
      .map(p => getPlaylist(p.id))
  );
  const allSongs = allPlaylists.reduce(
    (acc, curr) => acc.concat(curr.songList),
    [] as NoxMedia.Song[]
  );
  const cachedSongs = isDataSaving ? dataSaverSongs(allSongs) : allSongs;
  playAsSearchList({
    songs: cachedSongs,
    playlistSongs: allSongs,
    title: i18n.t('PlaylistOperations.all'),
  });
};

export const shuffleAll = (isDataSaving = false) => {
  const appState = useNoxSetting.getState();
  return _shuffleAll({
    playlists: appState.playlists,
    getPlaylist: appState.getPlaylist,
    isDataSaving,
  });
};

interface PlayFromSearch {
  query: string;
  playlistIds: string[];
  getPlaylist: (key: string) => Promise<NoxMedia.Playlist>;
  searchPlaylist: NoxMedia.Playlist;
  setSearchPlaylist: (searchPlaylist: NoxMedia.Playlist) => void;
  setCurrentPlaylist: (playlist: NoxMedia.Playlist) => void;
  currentPlayingList: NoxMedia.Playlist;
  playlists: { [key: string]: NoxMedia.Playlist };
  playFromPlaylistF?: (args: PlayFromPlaylist) => void;
  shuffleAllF?: () => void;
  playAsSearchListF?: (args: PlayAsSearchList) => void;
}
export const _playFromSearch = async ({
  query,
  playlistIds,
  getPlaylist,
  searchPlaylist,
  currentPlayingList,
  playlists,
  playFromPlaylistF = playFromPlaylist,
  shuffleAllF = shuffleAll,
  playAsSearchListF = playAsSearchList,
}: PlayFromSearch) => {
  // first go through the current playlist and match the exact song name with query.
  // then go through the current playlist and match the loose song name with query.
  // then go through playlist names and match the exact playlist name with query.
  // then go through every playlist and match the loose song name with query.
  if (query === '') {
    if (playlistIds.length === 0) {
      if (searchPlaylist.songList.length > 0) {
        playFromPlaylistF({ playlist: searchPlaylist });
        return;
      }
      playAsSearchListF({ songs: await fetchCurrentMusicTop() });
      return;
    }
    playFromPlaylistF({
      playlist: await getPlaylist(randomChoice(playlistIds)),
    });
    return;
  }
  for (const song of currentPlayingList.songList) {
    if (song.name.toLowerCase() === query) {
      playFromPlaylistF({ playlist: currentPlayingList, song });
      return;
    }
  }
  for (const song of currentPlayingList.songList) {
    if (song.name.toLowerCase().includes(query)) {
      playFromPlaylistF({ playlist: currentPlayingList, song });
      return;
    }
  }
  for (const playlist of Object.values(playlists)) {
    if (playlist.title.toLowerCase() === query) {
      playFromPlaylistF({ playlist: await getPlaylist(playlist.id) });
      return;
    }
  }
  for (const playlistId of playlistIds) {
    const playlist = await getPlaylist(playlistId);
    for (const song of playlist.songList) {
      if (song.name.toLowerCase().includes(query)) {
        playFromPlaylistF({ playlist, song });
        return;
      }
    }
  }
  shuffleAllF();
  return true;
};

export const playFromSearch = async (query: string) => {
  const appState = useNoxSetting.getState();
  return _playFromSearch({
    query,
    playlistIds: appState.playlistIds,
    getPlaylist: appState.getPlaylist,
    searchPlaylist: appState.searchPlaylist,
    currentPlayingList: appState.currentPlayingList,
    playlists: appState.playlists,
    setSearchPlaylist: appState.setSearchPlaylist,
    setCurrentPlaylist: appState.setCurrentPlaylist,
  });
};
