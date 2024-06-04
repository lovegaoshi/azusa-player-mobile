import SongTS from '@objects/Song';
import { Source } from '@enums/MediaFetch';
import { Innertube } from 'youtubei.js';

export const resolveURL = async (song: NoxMedia.Song) => {
  const yt = await Innertube.create();
  const extractedVideoInfo = await yt.getInfo(song.bvid);
  const maxAudioQualityStream = extractedVideoInfo.chooseFormat({
    quality: 'best',
    type: 'audio',
  });
  return {
    url: maxAudioQualityStream.decipher(yt.session.player),
    loudness: maxAudioQualityStream.loudness_db,
  };
};

export const fetchAudioInfo = async (sid: string) => {
  const yt = await Innertube.create();
  const videoInfo = (await yt.getBasicInfo(sid)).basic_info;
  return [
    SongTS({
      cid: `${Source.ytbvideo}-${sid}`,
      bvid: sid,
      name: videoInfo.title!,
      nameRaw: videoInfo.title!,
      singer: videoInfo.author!,
      singerId: videoInfo.channel_id!,
      cover: videoInfo.thumbnail
        ? videoInfo.thumbnail[videoInfo.thumbnail.length - 1]!.url
        : '',
      lyric: '',
      page: 1,
      duration: videoInfo.duration,
      album: videoInfo.title!,
      source: Source.ytbvideo,
      metadataOnLoad: true,
    }),
  ];
};
