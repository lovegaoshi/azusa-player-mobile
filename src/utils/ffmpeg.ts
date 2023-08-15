import { FFmpegKit } from 'ffmpeg-kit-react-native';
import RNFetchBlob from 'react-native-blob-util';
import TrackPlayer from 'react-native-track-player';
import logger from './Logger';

const parseReplayGainLog = (log: string) => {
  const regex = /Parsed_replaygain.+ track_gain = (.+) dB/g;
  regex.exec(log);
  const match = regex.exec(log);
  if (!match) throw new Error('[ffmpeg] no replaygain found!');
  logger.debug(`[ffmpeg] r128gain resolved: ${match[1]} dB`);
  if (match[1][0] === '+') {
    logger.debug('[ffmpeg] r128gain of positive dB is not yet supported!');
  }
  return Number(match[1].substring(1));
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

export const setR128Gain = async (
  gain: number | string,
  song: NoxMedia.Song
) => {
  console.debug(`[r128gain] set r128gain to ${gain} dB`);
  if (typeof gain === 'string') {
    gain = Number(gain.substring(1));
  }
  if (gain >= 0) {
    logger.warn(`[ffmpeg] positive ${gain} dB is not yet supported!`);
    return;
  }
  if (song.id !== (await TrackPlayer.getActiveTrack())?.song?.id) {
    logger.warn(`${song.parsedName} is no longer the active track.`);
    return;
  }
  try {
    const volume = Math.pow(10, -gain / 20);
    console.debug(`[r128gain] set r128gain volume to ${volume}`);
    return await TrackPlayer.setVolume(volume);
  } catch (e) {
    logger.warn(`[ffmpeg] r128gain set error: ${e}`);
    return await TrackPlayer.setVolume(1);
  }
};
