import { EmitterSubscription, Platform } from 'react-native';
import { useEffect } from 'react';
import TrackPlayer, { Event } from 'react-native-track-player';
import { useTranslation } from 'react-i18next';

import { songlistToTracklist } from '../objects/Playlist';
import { useNoxSetting } from './useSetting';
import { randomChoice } from '../utils/Utils';
import logger from '../utils/Logger';

const PLAYLIST_MEDIAID = 'playlist-';

const usePlayback = () => {
  const { t } = useTranslation();
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);
  const playlists = useNoxSetting(state => state.playlists);
  const playlistIds = useNoxSetting(state => state.playlistIds);
  const setCurrentPlayingId = useNoxSetting(state => state.setCurrentPlayingId);
  const setCurrentPlayingList = useNoxSetting(
    state => state.setCurrentPlayingList
  );

  const playFromPlaylist = async (
    playlist: NoxMedia.Playlist,
    song?: NoxMedia.Song
  ) => {
    await TrackPlayer.reset();
    setCurrentPlayingList(playlist);
    if (song === undefined) {
      if (playlist.songList.length === 0) {
        // no song exists.
        logger.warn(`${playlist.id} is empty.`);
        return;
      } else {
        song = randomChoice(playlist.songList);
      }
    }
    setCurrentPlayingId(song.id);
    await TrackPlayer.add(songlistToTracklist([song]));
    TrackPlayer.play();
  };

  const playFromMediaId = (mediaId: string) => {
    logger.log(`[playFromMediaId]: ${mediaId}`);
    if (mediaId.startsWith(PLAYLIST_MEDIAID)) {
      mediaId = mediaId.substring(PLAYLIST_MEDIAID.length);
      // play a playlist.
      if (playlists[mediaId] === undefined) {
        logger.warn(`${mediaId} doesnt exist.`);
        return;
      }
      playFromPlaylist(playlists[mediaId]);
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
          playFromPlaylist(currentPlayingList, song);
          return;
        }
      }
      for (const playlist of Object.values(playlists)) {
        for (const song of playlist.songList) {
          if (song.bvid === songBVID && song.id === songCID) {
            playFromPlaylist(playlist, song);
            return;
          }
        }
      }
      logger.warn(`[playFromMediaId]: ${mediaId} does not exist.`);
    }
  };

  const playFromSearch = (query: string) => {
    // first go through the current playlist and match the exact song name with query.
    // then go through the current playlist and match the loose song name with query.
    // then go through playlist names and match the exact playlist name with query.
    // then go through every playlist and match the loose song name with query.
    if (query === '') {
      playFromPlaylist(playlists[randomChoice(Object.keys(playlists))]);
    }
    for (const song of currentPlayingList.songList) {
      if (song.name.toLowerCase() === query) {
        playFromPlaylist(currentPlayingList, song);
        return;
      }
    }
    for (const song of currentPlayingList.songList) {
      if (song.name.toLowerCase().includes(query)) {
        playFromPlaylist(currentPlayingList, song);
        return;
      }
    }
    for (const playlist of Object.values(playlists)) {
      if (playlist.title.toLowerCase() === query) {
        playFromPlaylist(playlist);
        return;
      }
    }
    for (const playlist of Object.values(playlists)) {
      for (const song of playlist.songList) {
        if (song.name.toLowerCase().includes(query)) {
          playFromPlaylist(playlist, song);
          return;
        }
      }
    }
  };

  const buildBrowseTree = () => {
    if (Platform.OS !== 'android') return;
    TrackPlayer.setBrowseTree({
      '/': [
        {
          mediaId: 'PlaylistTab',
          title: t('AndroidAuto.PlaylistTab'),
          playable: '1',
        },
      ],
      PlaylistTab: Object.keys(playlists).map(key => {
        return {
          mediaId: `${PLAYLIST_MEDIAID}${key}`,
          title: playlists[key].title,
          playable: '0',
        };
      }),
    });
  };

  return { buildBrowseTree, playFromMediaId, playFromSearch, playFromPlaylist };
};

export default usePlayback;
