/**
interface IBeatMatch {
  song1Beats: number[];
  song2Beats: number[];
  crossfadeInterveral: number;
  song1Duration?: number;
  song1FadeOut?: number;
  song2FadeIn?: number;
}
export const beatMatch = ({}: IBeatMatch) => {
  // first determine song1's fade out range.
};

 */
import { getSongBeat } from '../db/sqlAPI';
import { setSongBeat } from '../db/sqlStorage';
import logger from '../Logger';
import NativeNoxModule from '@specs/NativeNoxModule';
import { isAndroid } from '../RNUtils';

export const setNoxBeats = async (path: string, song: NoxMedia.Song) => {
  if (!isAndroid || getSongBeat(song.id) !== undefined) return;
  logger.debug(
    `[beatDetection] now starting FFMPEG/darsosDSP beatroot beat detection for ${song.id}`,
  );
  const beats = (await NativeNoxModule?.calcBeatsFromFile?.(path)) ?? [];
  logger.debug(
    beats.length > 0
      ? `[beatDetection] beat calculation saved for ${song.id}`
      : `[beatDetection] no beats found for ${song.id}`,
  );
  setSongBeat(song.id, beats);
};
