import { Thumbnail } from 'youtubei.js/dist/src/parser/misc';
import {
  CompactVideo,
  PlaylistPanelVideo,
} from 'youtubei.js/dist/src/parser/nodes';

import SongTS from '@objects/Song';
import { Source } from '@enums/MediaFetch';
import { logger } from '@utils/Logger';
import ytClient, { ytClientWeb } from '@utils/mediafetch/ytbi';
import { isIOS } from '@utils/RNUtils';

const getHiResThumbnail = (thumbnails?: Thumbnail[]) => {
  if (!thumbnails) return '';
  return thumbnails.sort((a, b) => b.width - a.width)[0]!.url;
};

export const resolveURL = async (song: NoxMedia.Song, iOS = false) => {
  logger.debug(`[ytbi.js] fetch YTB playURL promise:${song.bvid}`);
  const yt = await ytClient();
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

export const suggestYTM = async (
  song: NoxMedia.Song,
  filterMW = <T>(v: T[]) => v[0],
) => {
  console.log('ytm suggest2');
  const yt = await ytClientWeb;
  const videoInfo = await yt.music.getUpNext(song.bvid);
  const relatedVideos = videoInfo.contents as PlaylistPanelVideo[];
  const parsedVideos = relatedVideos.slice(1).map(suggestSong =>
    SongTS({
      cid: `${Source.ytbvideo}-${suggestSong.video_id}`,
      bvid: suggestSong.video_id,
      name: suggestSong.title.text!,
      nameRaw: suggestSong.title.text!,
      singer: suggestSong.author,
      singerId: suggestSong.artists?.[0]?.channel_id ?? '',
      cover: suggestSong.thumbnail[0].url,
      lyric: '',
      page: 1,
      duration: Number(suggestSong.duration.seconds),
      album: suggestSong.title.text,
      source: Source.ytbvideo,
      metadataOnLoad: true,
    }),
  );
  return filterMW(parsedVideos);
};

export const suggest = async (
  song: NoxMedia.Song,
  filterMW = <T>(v: T[]) => v[0],
) => {
  console.log('ytm suggest');
  const yt = await ytClientWeb;
  const videoInfo = await yt.getInfo(song.bvid);
  try {
    const relatedVideos =
      videoInfo.watch_next_feed as unknown as CompactVideo[];
    const parsedVideos = relatedVideos.map(suggestSong =>
      SongTS({
        cid: `${Source.ytbvideo}-${suggestSong.id}`,
        bvid: suggestSong.id,
        name: suggestSong.title.text!,
        nameRaw: suggestSong.title.text!,
        singer: suggestSong.author.name,
        singerId: suggestSong.author.id,
        cover: suggestSong.thumbnails[0].url,
        lyric: '',
        page: 1,
        duration: Number(suggestSong.duration.seconds),
        album: suggestSong.title.text,
        source: Source.ytbvideo,
        metadataOnLoad: true,
      }),
    );
    return filterMW(parsedVideos);
  } catch (e) {
    logger.warn(`[ytbi] suggest related videos failed as ${e}; now using ytm.`);
    return suggestYTM(song, filterMW);
  }
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
