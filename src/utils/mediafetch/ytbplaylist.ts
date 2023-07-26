import { regexFetchProps } from './generic';
import { fetchAudioInfo, CIDPREFIX } from './ytbvideo';
import SongTS from 'objects/Song';
import logger from '../Logger';

const fetchYTPlaylist = async (
  playlistId: string,
  progressEmitter: (val: number) => void,
  favList: string[]
): Promise<NoxMedia.Song[][]> => {
  const res = await fetch(
    `https://www.youtube.com/playlist?list=${playlistId}`
  );
  const content = await res.text();
  // https://www.thepythoncode.com/code/get-youtube-data-python
  try {
    const ytInitialData = /var ytInitialData = ({.*});<\/script/.exec(content);
    if (ytInitialData === null) {
      throw Error();
    }
    const data = JSON.parse(`${ytInitialData[1]}`);
    return data.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents
      .map((val: any) => [
        SongTS({
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
        }),
      ])
      .filter((val: NoxMedia.Song) => !favList.includes(val.bvid));
  } catch (e) {
    logger.error(`[YTPlaylist] fast resolve failed: ${e}`);
    const matchedSet = new Set<string>();
    for (const matched of content.matchAll(/\/watch\?v=([A-Za-z0-9_-]{11})/g)) {
      matchedSet.add(matched[1]);
    }
    return await Promise.all(
      Array.from(matchedSet)
        .filter(val => !favList.includes(val))
        .map((val, index, arr) =>
          fetchAudioInfo(val, () => progressEmitter((index * 100) / arr.length))
        )
    );
  }
};

const regexFetch = async ({
  reExtracted,
  progressEmitter = () => undefined,
  favList = [],
}: regexFetchProps) => {
  const results = await fetchYTPlaylist(
    reExtracted[1],
    progressEmitter,
    favList
  );
  return results
    .filter(val => val !== undefined)
    .reduce((acc, curr) => acc!.concat(curr!), [] as NoxMedia.Song[]);
};

export default {
  regexSearchMatch: /youtu.*list=([^&]+)/,
  regexFetch,
};
