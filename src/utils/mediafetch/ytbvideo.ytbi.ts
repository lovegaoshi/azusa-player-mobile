import SongTS from '@objects/Song';
import { Source } from '@enums/MediaFetch';
import { logger } from '@utils/Logger';
import ytClient, { resetYtClient } from '@utils/mediafetch/ytbi';
import { isIOS } from '@utils/RNUtils';
import { Thumbnail } from 'youtubei.js/dist/src/parser/misc';

const getHiResThumbnail = (thumbnails?: Thumbnail[]) => {
  if (!thumbnails) return '';
  return thumbnails.sort((a, b) => b.width - a.width)[0]!.url;
};

interface ResolveURL {
  song: NoxMedia.Song;
  iOS?: boolean;
  reset?: boolean;
}

const _resolveURL = async ({
  song,
  iOS = false,
  reset = false,
}: ResolveURL): Promise<NoxNetwork.ParsedNoxMediaURL> => {
  logger.debug(`[ytbi.js] fetch YTB playURL promise:${song.bvid}`);
  const yt = await ytClient();
  const extractedVideoInfo = await yt.getBasicInfo(song.bvid, 'IOS');
  const maxAudioQualityStream = extractedVideoInfo.chooseFormat({
    quality: 'best',
    type: 'audio',
  });
  const thumbnails = extractedVideoInfo.basic_info.thumbnail;
  const url =
    iOS && isIOS && extractedVideoInfo.streaming_data?.hls_manifest_url
      ? extractedVideoInfo.streaming_data?.hls_manifest_url
      : maxAudioQualityStream.decipher(yt.actions.session.player);
  if (url || reset) {
    return {
      url,
      cover: getHiResThumbnail(thumbnails),
      loudness: maxAudioQualityStream.loudness_db,
    };
  }
  logger.warn('[ytbi] resetting ytClient to retrive player. This takes time.');
  await resetYtClient();
  return _resolveURL({ song, iOS, reset: true });
};

export const resolveURL = async (song: NoxMedia.Song, iOS = false) =>
  _resolveURL({ song, iOS });

export const fetchAudioInfo = async (sid: string) => {
  const yt = await ytClient();
  const videoInfo = (await yt.getBasicInfo(sid, 'IOS')).basic_info;
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
