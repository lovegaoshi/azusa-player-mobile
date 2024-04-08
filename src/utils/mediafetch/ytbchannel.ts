/* eslint-disable @typescript-eslint/no-explicit-any */
import { get_playlist } from 'libmuse';

import { regexFetchProps } from './generic';
import { CIDPREFIX } from './ytbvideo';
import SongTS from '@objects/Song';
import { SOURCE } from '@enums/MediaFetch';

const musePlaylistItemToNoxSong = (val: any, data: any) => {
  try {
    return SongTS({
      cid: `${CIDPREFIX}-${val.videoId}`,
      bvid: val.videoId,
      name: val.title,
      nameRaw: val.title,
      singer: val.artists[0].name,
      singerId: val.artists[0].id,
      cover: val.thumbnails[0].url,
      highresCover: val.thumbnails[val.thumbnails.length - 1].url,
      lyric: '',
      page: 1,
      duration: val.duration_seconds,
      album: data.title,
      source: SOURCE.ytbvideo,
      metadataOnLoad: true,
    });
  } catch {
    console.error(`[musePlaylistParse] fail: ${JSON.stringify(val)}`);
  }
};

const fetchInnerTunePlaylist = async (
  playlistId: string,
  favList: string[] = []
): Promise<NoxMedia.Song[]> => {
  const stopAfter = (val: any[]) => {
    for (const song of val) {
      const songID = song.videoId;
      if (favList.includes(songID)) {
        return true;
      }
    }
    return false;
  };
  const playlistData = await get_playlist(
    playlistId,
    // TODO: fix libmuse that limit=0 retrieves all
    { limit: 999 },
    stopAfter
  );
  return playlistData.tracks
    .flatMap(val =>
      val && val.videoId && !favList.includes(val.videoId)
        ? musePlaylistItemToNoxSong(val, playlistData)
        : []
    )
    .filter((val): val is NoxMedia.Song => val !== undefined);
};

const regexFetch = async ({
  reExtracted,
  favList = [],
}: regexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => {
  const results = await fetchInnerTunePlaylist(
    // fetchYTPlaylist(
    reExtracted[1],
    // progressEmitter,
    favList
  );
  return { songList: results.filter(val => val !== undefined) };
};

export default {
  regexSearchMatch: /youtu.*list=([^&]+)/,
  regexFetch,
};
