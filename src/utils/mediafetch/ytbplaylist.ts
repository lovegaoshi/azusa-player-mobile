/* eslint-disable @typescript-eslint/no-explicit-any */
import { get_playlist } from 'libmuse';

import { regexFetchProps } from './generic';
import { fetchAudioInfo, CIDPREFIX } from './ytbvideo';
import SongTS from '@objects/Song';
import { logger } from '../Logger';
import { Source } from '@enums/MediaFetch';

const musePlaylistItemToNoxSong = (val: any, data: any) => {
  try {
    return SongTS({
      cid: `${CIDPREFIX}-${val.videoId}`,
      bvid: val.videoId,
      name: val.title,
      nameRaw: val.title,
      singer: val.artists[0].name,
      singerId: val.artists[0].id,
      cover: val.thumbnails[val.thumbnails.length - 1].url,
      lyric: '',
      page: 1,
      duration: val.duration_seconds,
      album: data.title,
      source: Source.ytbvideo,
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

const fastYTPlaylistSongResolve = (val: any, data: any) => {
  try {
    return SongTS({
      cid: `${CIDPREFIX}-${val.playlistVideoRenderer.videoId}`,
      bvid: val.playlistVideoRenderer.videoId,
      name: val.playlistVideoRenderer.title.runs[0].text,
      nameRaw: val.playlistVideoRenderer.title.runs[0].text,
      singer: val.playlistVideoRenderer.shortBylineText.runs[0].text,
      singerId:
        val.playlistVideoRenderer.shortBylineText.runs[0].navigationEndpoint
          .browseEndpoint.browseId,
      cover:
        val.playlistVideoRenderer.thumbnail.thumbnails[
          val.playlistVideoRenderer.thumbnail.thumbnails.length - 1
        ].url,
      lyric: '',
      page: Number(val.playlistVideoRenderer.index.simpleText),
      duration: Number(val.playlistVideoRenderer.lengthSeconds),
      album: data.metadata.playlistMetadataRenderer.title,
      source: Source.ytbvideo,
      metadataOnLoad: true,
    });
  } catch (e) {
    logger.error(
      `[fastYTPlaylistSongResolve] failed ${e} of ${JSON.stringify(val)}`
    );
    return undefined;
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fetchYTPlaylist = async (
  playlistId: string,
  progressEmitter: (val: number) => void,
  favList: string[]
): Promise<NoxMedia.Song[]> => {
  const res = await fetch(
    `https://www.youtube.com/playlist?list=${playlistId}`
  );
  const content = await res.text();
  // https://www.thepythoncode.com/code/get-youtube-data-python
  try {
    const ytInitialData = /var ytInitialData = ({.*});<\/script/.exec(content);
    if (ytInitialData === null) {
      throw Error('ytbInitdata failed');
    }
    const data = JSON.parse(`${ytInitialData[1]}`);
    return data.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents
      .map((val: any) => fastYTPlaylistSongResolve(val, data))
      .filter(
        (val: NoxMedia.Song | undefined) => val && !favList.includes(val?.bvid)
      );
  } catch (e) {
    logger.error(`[YTPlaylist] fast resolve failed: ${e}`);
    const matchedSet = new Set<string>();
    for (const matched of content.matchAll(/\/watch\?v=([A-Za-z0-9_-]{11})/g)) {
      matchedSet.add(matched[1]);
    }
    return (
      await Promise.all(
        Array.from(matchedSet)
          .filter(val => !favList.includes(val))
          .map((val, index, arr) =>
            fetchAudioInfo(val, () =>
              progressEmitter((index * 100) / arr.length)
            )
          )
      )
    ).reduce((acc, curr) => acc!.concat(curr), []);
  }
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
