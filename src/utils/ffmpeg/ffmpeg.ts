import { FFmpegKit, FFprobeKit } from 'ffmpeg-kit-react-native';
import RNFetchBlob from 'react-native-blob-util';
import TrackPlayer from 'react-native-track-player';

import { logger } from '../Logger';
import { r128gain2Volume } from '../Utils';
import { singleLimiter } from '../mediafetch/throttle';
import { validateFile } from '../RNUtils';

const tempArtPath = `${RNFetchBlob.fs.dirs.CacheDir}/tempCover.jpg`;

export const base64AlbumArt = (path = tempArtPath) =>
  RNFetchBlob.fs
    .readFile(path, 'base64')
    .then(v => `data:image/png;base64,${v}`)
    .catch(() => undefined);

export const cacheAlbumArt = async (fpath: string) =>
  singleLimiter.schedule(async () => {
    RNFetchBlob.fs.unlink(tempArtPath).catch();
    // HACK: exoplayer handles embedded art but I also need this for the UI...
    await FFmpegKit.execute(`-i '${fpath}' -an -vcodec copy ${tempArtPath}`);
    return (await validateFile(tempArtPath)) ? tempArtPath : undefined;
  });

export const probeMetadata = async (
  fspath: string
): Promise<NoxMedia.FFProbeMetadata> => {
  const session = await FFprobeKit.execute(
    `-v quiet -print_format json -show_format '${fspath}'`
  );
  const parsedMetadata = JSON.parse(await session.getOutput());
  logger.debug(parsedMetadata);
  return parsedMetadata.format;
};

const parseReplayGainLog = (log: string) => {
  const regex = /Parsed_replaygain.+ track_gain = (.+) dB/g;
  regex.exec(log);
  const match = regex.exec(log);
  if (!match) {
    logger.error('[ffmpeg] no replaygain found!');
    logger.debug(`[ffmpeg] debug log:${log}`);
    return 0;
  }
  logger.debug(`[ffmpeg] r128gain resolved: ${match[1]} dB`);
  if (match[1].startsWith('+')) {
    logger.debug('[ffmpeg] r128gain of positive dB is not yet supported!');
  }
  return Number(match[1]);
};

export const r128gain = async (fspath: string) => {
  logger.debug(`[ffmpeg] probing r128gain of ${fspath}`);
  const session = await FFmpegKit.execute(
    `-i '${fspath}' -nostats -filter_complex replaygain -f null -`
  );
  return parseReplayGainLog(await session.getOutput());
};

export const ffmpegToMP3 = async (fspath: string) => {
  await FFmpegKit.execute(`-i '${fspath}' -vn -ab 256k ${fspath}.mp3`);
  RNFetchBlob.fs.unlink(fspath).catch();
  return `${fspath}.mp3`;
};

export const setTPR128Gain = async (gain: number, fade = 0, init = -1) => {
  const volume = r128gain2Volume(gain || 0);
  logger.debug(`[r128gain] set r128gain volume to ${volume} in ${fade}`);
  TrackPlayer.setAnimatedVolume({ volume, duration: fade, init });
};

export const setR128Gain = async (
  gain: number | string,
  song: NoxMedia.Song,
  fade = 0,
  init = -1
) => {
  logger.debug(`[r128gain] set r128gain to ${gain} dB`);
  if (typeof gain === 'string') {
    gain = Number(gain);
    if (Number.isNaN(gain)) gain = 0;
  }
  if (song.id !== (await TrackPlayer.getActiveTrack())?.song?.id) {
    logger.debug(`${song.parsedName} is no longer the active track.`);
    return;
  }
  setTPR128Gain(gain, fade, init);
};
