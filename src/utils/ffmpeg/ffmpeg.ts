import { FFmpegKit, FFprobeKit } from 'ffmpeg-kit-react-native';
import RNFetchBlob from 'react-native-blob-util';
import TrackPlayer from 'react-native-track-player';

import { logger } from '../Logger';
import { r128gain2Volume } from '../Utils';

export const probeMetadata = async (fspath: string) => {
  const session = await FFprobeKit.execute(
    `-show_format -print_format json '${fspath}'`
  );
  console.log(await session.getOutput());
};
const parseReplayGainLog = (log: string) => {
  const regex = /Parsed_replaygain.+ track_gain = (.+) dB/g;
  regex.exec(log);
  const match = regex.exec(log);
  if (!match) throw new Error('[ffmpeg] no replaygain found!');
  logger.debug(`[ffmpeg] r128gain resolved: ${match[1]} dB`);
  if (match[1][0] === '+') {
    logger.debug('[ffmpeg] r128gain of positive dB is not yet supported!');
  }
  return Number(match[1]);
};

export const r128gain = async (fspath: string) => {
  const session = await FFmpegKit.execute(
    `-i '${fspath}' -filter_complex '[0:a]aformat=channel_layouts=stereo:sample_fmts=s16:sample_rates=48000[s0];[s0]asplit=2:outputs=2[s1][s2];[s1]replaygain[s3];[s3]anullsink;[s2]ebur128=framelog=verbose[s5]' -map '[s5]' -f null ${fspath}.tmp -hide_banner -nostats`
  );
  RNFetchBlob.fs.unlink(`${fspath}.tmp`);
  return parseReplayGainLog(await session.getOutput());
};

export const ffmpegToMP3 = async (fspath: string) => {
  await FFmpegKit.execute(`-i '${fspath}' -vn -ab 256k ${fspath}.mp3`);
  RNFetchBlob.fs.unlink(fspath);
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
