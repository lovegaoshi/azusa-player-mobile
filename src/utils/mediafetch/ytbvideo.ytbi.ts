import SongTS from '@objects/Song';
import { Source } from '@enums/MediaFetch';
import { logger } from '@utils/Logger';
import ytClient, { ytClientWeb } from '@utils/mediafetch/ytbi';
import { isIOS } from '@utils/RNUtils';
import { Thumbnail } from 'youtubei.js/dist/src/parser/misc';

const getHiResThumbnail = (thumbnails?: Thumbnail[]) => {
  if (!thumbnails) return '';
  return thumbnails.sort((a, b) => b.width - a.width)[0]!.url;
};

export const resolveURL = async (song: NoxMedia.Song, iOS = false) => {
  logger.debug(`[ytbi.js] fetch YTB playURL promise:${song.bvid}`);
  const yt = await ytClient;
  const extractedVideoInfo = await yt.getBasicInfo(song.bvid, 'IOS');
  const maxAudioQualityStream = extractedVideoInfo.chooseFormat({
    quality: 'best',
    type: 'audio',
  });
  const thumbnails = extractedVideoInfo.basic_info.thumbnail;
  return {
    url:
      iOS && isIOS && extractedVideoInfo.streaming_data?.hls_manifest_url
        ? extractedVideoInfo.streaming_data?.hls_manifest_url
        : maxAudioQualityStream.decipher(yt.actions.session.player),
    // cover: getHiResThumbnail(thumbnails),
    loudness: maxAudioQualityStream.loudness_db,
  };
};

export const fetchAudioInfo = async (sid: string) => {
  const yt = await ytClientWeb;
  const videoInfo = (await yt.getBasicInfo(sid)).basic_info;
  return [
    SongTS({
      cid: `${Source.ytbvideo}-${sid}`,
      bvid: sid,
      name: videoInfo.title!,
      nameRaw: videoInfo.title!,
      singer: videoInfo.author!,
      singerId: videoInfo.channel_id!,
      cover: getHiResThumbnail(videoInfo.thumbnail),
      lyric: '',
      page: 1,
      duration: videoInfo.duration,
      album: videoInfo.title!,
      source: Source.ytbvideo,
      metadataOnLoad: true,
    }),
  ];
};
