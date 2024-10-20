import { Video } from 'youtubei.js/dist/src/parser/nodes';

import SongTS from '@objects/Song';
import { Source } from '@enums/MediaFetch';
import { ytClientWeb } from '@utils/mediafetch/ytbi';
import { logger } from '@utils/Logger';

export const ytbiVideoToNoxSong = (val: Video) => {
  return SongTS({
    cid: `${Source.ytbvideo}-${val.id}`,
    bvid: val.id,
    name: val.title.text ?? 'N/A',
    nameRaw: val.title.text ?? 'N/A',
    singer: val.author.name,
    singerId: val.author.id,
    cover: val.thumbnails[0].url,
    lyric: '',
    page: 1,
    duration: val.duration.seconds,
    source: Source.ytbvideo,
    metadataOnLoad: true,
  });
};

export const fetchYtbiSearch = async (
  searchVal: string,
  favList: string[] = [],
): Promise<NoxMedia.Song[]> => {
  try {
    const yt = await ytClientWeb;
    const playlistData = await yt.search(searchVal);
    const videos = playlistData.videos as Video[];
    return videos
      .filter(v => v.type === 'Video')
      .map(val => (!favList.includes(val.id) ? ytbiVideoToNoxSong(val) : []))
      .filter((val): val is NoxMedia.Song => val !== undefined);
  } catch (e) {
    logger.error(`[Ytbi.js Search] search ${searchVal} failed!`);
    console.error(e);
    return [];
  }
};
