import { PlaylistMediaID, YTMChartMediaID } from '@enums/Playlist';
import { isAndroid } from '@utils/RNUtils';
import logger from '../Logger';
import { fetchYtbiPlaylist } from '@utils/mediafetch/ytbPlaylist.ytbi';
import { dummyPlaylistList } from '@objects/Playlist';
import useNoxMobile from '@stores/useMobile';

export const buildBrowseTree = (playlists: {
  [key: string]: NoxMedia.Playlist;
}) => {
  if (!isAndroid) return;
  useNoxMobile.getState().updateBrowseTree({
    PlaylistTab: Object.keys(playlists)
      .filter(v => playlists[v].songList.length > 0)
      .map(key => ({
        mediaId: `${PlaylistMediaID}${key}`,
        title: playlists[key].title,
        playable: '0',
      })),
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
      songList: await fetchYtbiPlaylist({
        playlistId: mediaId.substring(YTMChartMediaID.length),
      }),
    };
  }
  return undefined;
};
