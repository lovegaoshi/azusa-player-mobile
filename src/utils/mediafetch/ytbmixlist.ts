import last from 'lodash/last';

import SongTS from '@objects/Song';
import { timestampToSeconds } from '../Utils';
import { Source } from '@enums/MediaFetch';

const fetchYTPlaylist = async (
  playlistId: string,
  favList: string[],
  mixlistId?: string,
) => {
  const res = await fetch(
    `https://www.youtube.com/watch?v=${playlistId}&list=RD${
      mixlistId ?? playlistId
    }`,
  );
  const content = await res.text();
  // https://www.thepythoncode.com/code/get-youtube-data-python
  const ytInitialData = /var ytInitialData = ({.*});<\/script/.exec(content);
  if (ytInitialData === null) {
    throw Error();
  }
  const data = JSON.parse(`${ytInitialData[1]}`);

  const results: NoxMedia.Song[][] =
    data.contents.twoColumnWatchNextResults.playlist.playlist.contents
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((val: any, index: number) => [
        SongTS({
          cid: `${Source.ytbvideo}-${val.playlistPanelVideoRenderer.videoId}`,
          bvid: val.playlistPanelVideoRenderer.videoId,
          name: val.playlistPanelVideoRenderer.title.simpleText,
          nameRaw: val.playlistPanelVideoRenderer.title.simpleText,
          singer: val.playlistPanelVideoRenderer.shortBylineText.runs[0].text,
          singerId:
            val.playlistPanelVideoRenderer.shortBylineText.runs[0]
              .navigationEndpoint.browseEndpoint.browseId,
          cover: last(
            val.playlistPanelVideoRenderer.thumbnail.thumbnails as any[],
          ).url,
          lyric: '',
          page: index,
          duration: timestampToSeconds(
            val.playlistPanelVideoRenderer.lengthText.simpleText,
          ),
          album:
            data.contents.twoColumnWatchNextResults.playlist.playlist.title,
          source: Source.ytbvideo,
          metadataOnLoad: true,
        }),
      ])
      .filter((val: NoxMedia.Song) => !favList.includes(val.bvid));
  return results
    .filter(val => val !== undefined)
    .reduce((acc, curr) => acc.concat(curr), [] as NoxMedia.Song[]);
};
const regexFetch = async ({
  reExtracted,
  favList = [],
}: NoxNetwork.RegexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => {
  const songList = await fetchYTPlaylist(
    reExtracted[1],
    favList,
    reExtracted[2],
  );
  return {
    songList,
    refresh,
    refreshToken: [last(songList)!.bvid, songList[0].bvid],
  };
};

const refresh = async (v: NoxMedia.Playlist) => {
  const results: NoxMedia.SearchPlaylist = { songList: [] };
  if (v.refreshToken) {
    results.songList = await fetchYTPlaylist(
      v.refreshToken[0],
      v.songList.map(s => s.bvid),
      v.refreshToken[1],
    );
    results.refreshToken = [last(results.songList)!.bvid, v.refreshToken[1]];
  } else {
    results.songList = await fetchYTPlaylist(
      last(v.songList)!.bvid,
      v.songList.map(s => s.bvid),
      v.songList[0].bvid,
    );
    results.refreshToken = [last(results.songList)!.bvid, v.songList[0].bvid];
  }
  return results;
};

export default {
  regexSearchMatch: /youtu(?:.*\/v\/|.*v=|\.be\/)([A-Za-z0-9_-]{11})&list=RD/,
  regexSearchMatch2: /youtu.*list=RD([^&]+)/,
  regexSearchMatch3:
    /youtu(?:.*\/v\/|.*v=|\.be\/)([A-Za-z0-9_-]{11})&list=RD(.+)/,
  regexFetch,
  refresh,
};
