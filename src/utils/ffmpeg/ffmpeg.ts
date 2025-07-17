import { FFmpegKit, FFprobeKit } from 'ffmpeg-kit-react-native';
import RNFetchBlob from 'react-native-blob-util';
import TrackPlayer from 'react-native-track-player';

import { logger } from '../Logger';
import { r128gain2Volume, getExt } from '../Utils';
import { singleLimiter } from '../mediafetch/throttle';
import { validateFile } from '../RNUtils';

const tempArtPath = `${RNFetchBlob.fs.dirs.CacheDir}/tempCover.jpg`;

export const base64AlbumArt = (path = tempArtPath) =>
  RNFetchBlob.fs
    .readFile(path, 'base64')
    .then(v => `data:image/png;base64,${v}`)
    .catch(logger.error);

export const cacheAlbumArt = async (fpath: string) =>
  singleLimiter.schedule(async () => {
    RNFetchBlob.fs.unlink(tempArtPath).catch();
    // HACK: exoplayer handles embedded art but I also need this for the UI...
    await FFmpegKit.execute(`-i '${fpath}' -an -vcodec copy ${tempArtPath}`);
    return (await validateFile(tempArtPath)) ? tempArtPath : undefined;
  });

export const probeMetadata = async (
  fspath: string,
): Promise<NoxMedia.FFProbeMetadata> => {
  const session = await FFprobeKit.execute(
    `-v quiet -print_format json -show_format '${fspath}'`,
  );
  const parsedMetadata = JSON.parse(await session.getOutput());
  logger.debug(parsedMetadata);
  return parsedMetadata.format;
};

export const probeLoudness = async (
  fspath: string,
  threshold = -20,
  interval = 30,
): Promise<[number, number]> => {
  if (fspath.startsWith('file://')) {
    fspath = fspath.substring('file://'.length);
  }
  const session = await FFprobeKit.execute(
    `-v error -f lavfi -i "amovie=${fspath},asetnsamples=44100,astats=metadata=1:reset=1" -show_entries frame=pkt_pts_time:frame_tags=lavfi.astats.Overall.Peak_level -of csv=p=0`,
  );
  // https://stackoverflow.com/questions/32254818/generating-a-waveform-using-ffmpeg/32276471#32276471
  const parsedLoudness = await session.getOutput();
  // Peak level per second
  const loudness = parsedLoudness.split('\n').map(Number).slice(0, -1);

  const findBeginning = () => {
    for (let i = 0; i < interval; i++) {
      if (loudness[i] > threshold) {
        return i - 1;
      }
    }
    return -1;
  };

  const findEnd = () => {
    for (let i = loudness.length - 1; i > loudness.length - interval; i--) {
      if (loudness[i] > threshold) {
        return i + 1;
      }
    }
    return -1;
  };

  const arepeat = findBeginning();
  const brepeat = findEnd();

  return [
    arepeat < 0 ? 0 : (arepeat * 1.0) / loudness.length,
    brepeat < 0 ? 1 : (brepeat * 1.0) / loudness.length,
  ];
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
    `-i '${fspath}' -nostats -filter_complex replaygain -f null -`,
  );
  return parseReplayGainLog(await session.getOutput());
};

interface FFMpeg2MP3 {
  fspath: string;
  song?: NoxMedia.Song;
  unlink?: boolean;
}
export const ffmpegToMP3 = async ({
  fspath,
  song,
  unlink = true,
}: FFMpeg2MP3) => {
  if (song) {
    const coverArt = (
      await RNFetchBlob.config({
        fileCache: true,
        appendExt: getExt(song.cover) ?? 'jpg',
      })
        .fetch('GET', song.cover)
        .catch(e => console.warn(e))
    )?.path();
    const command = `-i '${fspath}' -vn -ab 256k -id3v2_version 3 -metadata title='${song.name.replace("'", '')}' -metadata artist='${song.singer}' -metadata album='${song.album?.replace("'", '') ?? ''}' ${fspath}.mp3`;
    logger.debug(`[ffmpeg] ffmpeg to mp3 command: ${command}`);
    await FFmpegKit.execute(command);
    if (coverArt) {
      logger.debug(`[ffmpeg] additionally inserting cover art...`);
      await FFmpegKit.execute(
        `-i '${fspath}.mp3' -i '${coverArt}' -map 0:a -map 1:0 -c copy ${fspath}.2.mp3`,
      );
      RNFetchBlob.fs.unlink(`${fspath}.mp3`).catch();
      RNFetchBlob.fs.unlink(coverArt).catch();
      return `${fspath}.2.mp3`;
    }
  } else {
    await FFmpegKit.execute(`-i '${fspath}' -vn -ab 256k ${fspath}.mp3`);
  }
  if (unlink) {
    RNFetchBlob.fs.unlink(fspath).catch();
  }
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
  init = -1,
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
