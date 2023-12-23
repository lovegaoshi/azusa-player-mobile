import { regexFetchProps } from './generic';
import { CIDPREFIX } from './ytbvideo';
import SongTS from '@objects/Song';
import { timestampToSeconds } from '../Utils';
import { SOURCE } from '@enums/MediaFetch';

const fetchYTPlaylist = async (
  playlistId: string,
  favList: string[],
  mixlistId?: string
): Promise<NoxMedia.Song[][]> => {
  const res = await fetch(
    `https://www.youtube.com/watch?v=${playlistId}&list=RD${
      mixlistId ?? playlistId
    }`
  );
  const content = await res.text();
  // https://www.thepythoncode.com/code/get-youtube-data-python
  const ytInitialData = /var ytInitialData = ({.*});<\/script/.exec(content);
  if (ytInitialData === null) {
    throw Error();
  }
  const data = JSON.parse(`${ytInitialData[1]}`);
  return (
    data.contents.twoColumnWatchNextResults.playlist.playlist.contents
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((val: any, index: number) => [
        SongTS({
          cid: `${CIDPREFIX}-${val.playlistPanelVideoRenderer.videoId}`,
          bvid: val.playlistPanelVideoRenderer.videoId,
          name: val.playlistPanelVideoRenderer.title.simpleText,
          nameRaw: val.playlistPanelVideoRenderer.title.simpleText,
          singer: val.playlistPanelVideoRenderer.shortBylineText.runs[0].text,
          singerId:
            val.playlistPanelVideoRenderer.shortBylineText.runs[0]
              .navigationEndpoint.browseEndpoint.browseId,
          cover:
            val.playlistPanelVideoRenderer.thumbnail.thumbnails[
              val.playlistPanelVideoRenderer.thumbnail.thumbnails.length - 1
            ].url,
          lyric: '',
          page: index,
          duration: timestampToSeconds(
            val.playlistPanelVideoRenderer.lengthText.simpleText
          ),
          album:
            data.contents.twoColumnWatchNextResults.playlist.playlist.title,
          source: SOURCE.ytbvideo,
          metadataOnLoad: true,
        }),
      ])
      .filter((val: NoxMedia.Song) => !favList.includes(val.bvid))
  );
};
const regexFetch = async ({ reExtracted, favList = [] }: regexFetchProps) => {
  const results = await fetchYTPlaylist(
    reExtracted[1],
    favList,
    reExtracted[2]
  );
  return results
    .filter(val => val !== undefined)
    .reduce((acc, curr) => acc!.concat(curr!), [] as NoxMedia.Song[]);
};

export default {
  regexSearchMatch: /youtu(?:.*\/v\/|.*v=|\.be\/)([A-Za-z0-9_-]{11})&list=RD/,
  regexSearchMatch2: /youtu.*list=RD([^&]+)/,
  regexSearchMatch3:
    /youtu(?:.*\/v\/|.*v=|\.be\/)([A-Za-z0-9_-]{11})&list=RD(.+)/,
  regexFetch,
};
