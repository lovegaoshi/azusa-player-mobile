import { Platform } from 'react-native';
import { useEffect, useState } from 'react';
import TrackPlayer, {
  Event,
  State,
  useActiveTrack,
  RepeatMode,
} from 'react-native-track-player';
import { useTranslation } from 'react-i18next';
import { useNetInfo } from '@react-native-community/netinfo';

import { useNoxSetting } from './useSetting';
import { randomChoice } from '../utils/Utils';
import logger from '../utils/Logger';
import { songlistToTracklist } from '@utils/RNTPUtils';
import { NoxRepeatMode } from '@enums/RepeatMode';
import noxPlayingList from '@stores/playingList';
import noxCache from '@utils/Cache';

const PLAYLIST_MEDIAID = 'playlist-';

const { getState } = noxPlayingList;

const dataSaverPlaylist = (playlist: NoxMedia.Playlist) => {
  const newSongList = playlist.songList.filter(
    song => noxCache.noxMediaCache?.peekCache(song) !== undefined
  );
  return newSongList.length === 0
    ? playlist
    : { ...playlist, songList: newSongList };
};

const dataSaverPlaylistWrapper = (datasave = true) => {
  return datasave
    ? dataSaverPlaylist
    : (playlist: NoxMedia.Playlist) => playlist;
};

const usePlayback = () => {
  const { t } = useTranslation();
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);
  const playlists = useNoxSetting(state => state.playlists);
  const setCurrentPlayingId = useNoxSetting(state => state.setCurrentPlayingId);
  const setCurrentPlayingList = useNoxSetting(
    state => state.setCurrentPlayingList
  );
  const track = useActiveTrack();
  const netInfo = useNetInfo();
  const playerSetting = useNoxSetting(state => state.playerSetting);

  const isDataSaving = () =>
    playerSetting.dataSaver && netInfo.type === 'cellular';

  const clearPlaylistUninterrupted = async () => {
    const currentQueue = await TrackPlayer.getQueue();
    const currentTrackIndex = await TrackPlayer.getActiveTrackIndex();
    if (currentTrackIndex === undefined) return;
    const removeTrackIndices = [...Array(currentQueue.length).keys()];
    removeTrackIndices.splice(currentTrackIndex, 1);
    await TrackPlayer.remove(removeTrackIndices);
  };

  const playFromPlaylist = async ({
    playlist,
    song,
    interruption = false,
    playlistParser = dataSaverPlaylistWrapper(false),
  }: PlayFromPlaylist) => {
    playlist = playlistParser(playlist);
    setCurrentPlayingList(playlist);
    if (getState().playmode === NoxRepeatMode.REPEAT_TRACK) {
      await TrackPlayer.setRepeatMode(RepeatMode.Off);
    }
    if (song === undefined) {
      if (playlist.songList.length === 0) {
        // no song exists.
        logger.warn(`[Playback] ${playlist.id} is empty.`);
        await TrackPlayer.reset();
        return;
      } else {
        song = randomChoice(playlist.songList);
      }
    }
    setCurrentPlayingId(song.id);
    if (!interruption && track?.song?.id === song.id) {
      clearPlaylistUninterrupted();
    } else {
      await TrackPlayer.reset();
      await TrackPlayer.add(await songlistToTracklist([song]));
      TrackPlayer.play();
    }
  };

  const playFromMediaId = (mediaId: string) => {
    logger.info(`[playFromMediaId]: ${mediaId}`);
    if (mediaId.startsWith(PLAYLIST_MEDIAID)) {
      mediaId = mediaId.substring(PLAYLIST_MEDIAID.length);
      // play a playlist.
      if (playlists[mediaId] === undefined) {
        logger.warn(`[Playback] ${mediaId} doesnt exist.`);
        return;
      }
      playFromPlaylist({
        playlist: playlists[mediaId],
        playlistParser: dataSaverPlaylistWrapper(isDataSaving()),
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
          playFromPlaylist({
            playlist: currentPlayingList,
            song,
            playlistParser: dataSaverPlaylistWrapper(isDataSaving()),
          });
          return;
        }
      }
      for (const playlist of Object.values(playlists)) {
        for (const song of playlist.songList) {
          if (song.bvid === songBVID && song.id === songCID) {
            playFromPlaylist({
              playlist,
              song,
              playlistParser: dataSaverPlaylistWrapper(isDataSaving()),
            });
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
      playFromPlaylist({
        playlist: playlists[randomChoice(Object.keys(playlists))],
      });
    }
    for (const song of currentPlayingList.songList) {
      if (song.name.toLowerCase() === query) {
        playFromPlaylist({ playlist: currentPlayingList, song });
        return;
      }
    }
    for (const song of currentPlayingList.songList) {
      if (song.name.toLowerCase().includes(query)) {
        playFromPlaylist({ playlist: currentPlayingList, song });
        return;
      }
    }
    for (const playlist of Object.values(playlists)) {
      if (playlist.title.toLowerCase() === query) {
        playFromPlaylist({ playlist });
        return;
      }
    }
    for (const playlist of Object.values(playlists)) {
      for (const song of playlist.songList) {
        if (song.name.toLowerCase().includes(query)) {
          playFromPlaylist({ playlist, song });
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

export const usePlaybackListener = () => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [newMetadata, setNewMetadata] = useState<any>({});

  useEffect(() => {
    if (!playerSetting.updateLoadedTrack) {
      return () => null;
    }
    const listener = TrackPlayer.addEventListener(
      Event.PlaybackState,
      async event => {
        if (event.state === State.Ready && newMetadata.updatedMetadata) {
          // TODO: supposed to update tracks now'
          logger.warn('supposed to update tracks now');
          setNewMetadata({});
        }
      }
    );
    return () => {
      listener.remove();
    };
  }, [playerSetting.updateLoadedTrack]);
};

export default usePlayback;

interface PlayFromPlaylist {
  playlist: NoxMedia.Playlist;
  song?: NoxMedia.Song;
  interruption?: boolean;
  playlistParser?: (playlist: NoxMedia.Playlist) => NoxMedia.Playlist;
}
