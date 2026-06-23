import {
  LockupView,
  ThumbnailOverlayBadgeView,
  ThumbnailView,
} from 'youtubei.js/dist/src/parser/nodes';
import { Playlist } from 'youtubei.js/dist/src/parser/youtube';

import SongTS from '@objects/Song';
import { Source } from '@enums/MediaFetch';
import { ytwebClient } from '@utils/mediafetch/ytbi';
import { fetchYtbiPlaylist as fetchYtmPlaylist } from './ytmPlaylist.ytbi';
import { getOriginORL, timestampToSeconds } from '../Utils';

export const ytbiPlaylistItemToNoxSong = (
  val: LockupView,
  albumtitle?: string,
) => {
  try {
    return SongTS({
      cid: `${Source.ytbvideo}-${val.content_id}`,
      bvid: val.content_id,
      name: val.metadata?.title.text ?? 'N/A',
      nameRaw: val.metadata?.title.text ?? 'N/A',
      singer:
        val.metadata?.metadata?.metadata_rows[0].metadata_parts?.[0].text
          ?.text ?? '',
      singerId:
        val.metadata?.metadata?.metadata_rows[0].metadata_parts?.[0].text
          ?.text ?? '',
      cover: getOriginORL((val.content_image as ThumbnailView).image[0].url),
      lyric: '',
      page: 1,
      duration: timestampToSeconds(
        (
          (val.content_image as ThumbnailView)
            .overlays[0] as ThumbnailOverlayBadgeView
        ).badges[0].text,
      ),
      album: albumtitle,
      source: Source.ytbvideo,
      metadataOnLoad: true,
    });
  } catch (e) {
    console.error(`[ytbiPlaylistParse] fail: ${JSON.stringify(val)}, ${e}`);
  }
};

const getYtbSong = async (
  playlistData: Playlist,
  songs: NoxMedia.Song[],
  favList: string[],
  limit = Infinity,
  getall = false,
) => {
  const videos = playlistData.videos as LockupView[];
  for (const video of videos) {
    if (!favList.includes(video.content_id)) {
      const song = ytbiPlaylistItemToNoxSong(video, playlistData.info.title);
      if (song) {
        songs.push(song);
      }
    } else if (!getall) {
      return songs;
    }
  }
  if (limit > songs.length && playlistData.has_continuation) {
    return getYtbSong(
      await playlistData.getContinuation(),
      songs,
      favList,
      limit,
      getall,
    );
  }
  return songs;
};

interface IFetchYtbiPlaylist {
  playlistId: string;
  favList?: string[];
  limit?: number;
  getall?: boolean;
}
export const fetchYtbiPlaylist = async ({
  playlistId,
  favList = [],
  limit = Infinity,
  getall = false,
}: IFetchYtbiPlaylist): Promise<NoxMedia.Song[]> => {
  const yt = await ytwebClient();
  try {
    return getYtbSong(
      await yt.getPlaylist(playlistId),
      [],
      favList,
      limit,
      getall,
    );
  } catch {
    return [];
  }
};

export const fetchPlaylist = async (
  playlistId: string,
  favList: string[] = [],
): Promise<NoxMedia.Song[]> =>
  fetchYtmPlaylist(playlistId, favList).catch(() =>
    fetchYtbiPlaylist({ playlistId, favList }),
  );
