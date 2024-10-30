import { get_song } from 'libmuse';
import _ from 'lodash';

import SongTS from '@objects/Song';
import { Source } from '@enums/MediaFetch';
import { logger } from '@utils/Logger';

export const resolveURL = async (song: NoxMedia.Song) => {
  logger.debug(`[ytb.muse] fetch YTB playURL promise:${song.bvid}`);
  const extractedVideoInfo = await get_song(song.bvid);
  let maxAudioQualityStream = { bitrate: 0, url: '' };
  const formats =
    extractedVideoInfo.adaptive_formats ?? extractedVideoInfo.formats ?? [];
  // eslint-disable-next-line no-restricted-syntax
  for (const videoStream of formats) {
    if (
      videoStream.has_audio &&
      videoStream.bitrate > maxAudioQualityStream.bitrate &&
      videoStream.codecs.includes('mp4a')
    ) {
      maxAudioQualityStream = videoStream;
    }
  }
  return {
    ...maxAudioQualityStream,
    // HACK: ytm loudness is off by 7. they are normalized against different stuff
    // HACK: still not matching ffmpeg's number..?
    loudness: extractedVideoInfo.playerConfig.audioConfig.loudnessDb + 7,
    perceivedLoudness:
      extractedVideoInfo.playerConfig.audioConfig.perceptualLoudnessDb,
  };
};

export const fetchAudioInfo = async (sid: string) => {
  const ytdlInfo = await get_song(sid);
  console.debug(ytdlInfo);
  const { videoDetails } = ytdlInfo;
  const formats = ytdlInfo.adaptive_formats ?? ytdlInfo.formats ?? [];
  const validDurations = formats.filter(format => format.duration_ms);
  return [
    SongTS({
      cid: `${Source.ytbvideo}-${sid}`,
      bvid: sid,
      name: videoDetails.title,
      nameRaw: videoDetails.title,
      singer: videoDetails.author,
      singerId: videoDetails.channelId,
      cover: _.last(videoDetails.thumbnail.thumbnails)!.url,
      lyric: '',
      page: 1,
      duration:
        validDurations.length > 0
          ? Math.floor(validDurations[0]!.duration_ms / 1000)
          : 0,
      album: videoDetails.title,
      source: Source.ytbvideo,
      metadataOnLoad: true,
    }),
  ];
};
