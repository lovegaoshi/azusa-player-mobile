import TrackPlayer from 'react-native-track-player';
import i18n from 'i18next';

import { PlaylistMediaID, YTMChartMediaID } from '@enums/Playlist';
import { isAndroid } from '@utils/RNUtils';
import logger from '../Logger';
import { fetchYtmPlaylist } from '@utils/mediafetch/ytbPlaylist.muse';
import { dummyPlaylistList } from '@objects/Playlist';

export const buildBrowseTree = (
  playlists: {
    [key: string]: NoxMedia.Playlist;
  },
  t = i18n.t,
) => {
  if (!isAndroid) return;
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
        mediaId: `${PlaylistMediaID}${key}`,
        title: playlists[key].title,
        playable: '0',
      };
    }),
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

export const parseFromMediaId = async ({
  mediaId,
  playlists,
  getPlaylist,
}: PlayFromMediaID) => {
  if (mediaId.startsWith(PlaylistMediaID)) {
    mediaId = mediaId.substring(PlaylistMediaID.length);
    // play a playlist.
    if (playlists[mediaId] === undefined) {
      logger.warn(`[Playback] ${mediaId} doesnt exist.`);
      return;
    }
    return getPlaylist(mediaId);
  } else if (mediaId.startsWith(YTMChartMediaID)) {
    return {
      ...dummyPlaylistList,
      id: YTMChartMediaID,
      songList: await fetchYtmPlaylist(
        mediaId.substring(YTMChartMediaID.length),
      ),
    };
  }
  return undefined;
};
