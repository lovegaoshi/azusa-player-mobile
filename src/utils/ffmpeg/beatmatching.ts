interface IBeatMatch {
  song1Beats: number[];
  song2Beats: number[];
  crossfadeInterveral: number;
  song1Duration?: number;
  bRepeat?: number;
  aRepeat?: number;
}

const calculateBeatDiff = (beats: number[]) => {
  const difference = beats.map((beat, index) => beats[index + 1] - beat);
  return difference.slice(0, difference.length - 1);
};

export const beatMatch = ({
  song1Beats,
  song2Beats,
  bRepeat,
  aRepeat,
  crossfadeInterveral,
}: IBeatMatch): [number, number] => {
  // first get the diff that would be used to match
  const song1BeatDiff = calculateBeatDiff(song1Beats);
  const song2BeatDiff = calculateBeatDiff(song2Beats);
  // here a beat at song1Beats index x should match for song1BeatDiff at x-1

  // get song1Fadeout and get the last beat index i should match at.
  // eg [0, 1,2,3,4,5] my brepeat is 4.5; it should find 4
  // so i find the first element larget than brepeat then subtract 1; else i want to return this length (5)
  const song1LastIndex = bRepeat
    ? song1Beats.findIndex(beat => beat > bRepeat) - 1
    : song1Beats.length;
  // eg [0, 1,2,3,4,5] my arepeat is 2.5; it should find 3
  const song2FirstIndex = aRepeat
    ? song2Beats.findIndex(beat => beat > aRepeat)
    : 0;

  // no beat matching: lets just take the first beat within the crossfade interval and jam it
  // to the first beat of the other song
  const song1Trans = song1Beats[song1LastIndex] - crossfadeInterveral;
  const song1Transition = song1Beats.findIndex(b => b > song1Trans);
  console.log(
    'beat map',
    song1Beats.slice(song1Transition),
    song2Beats.slice(song2FirstIndex, song2FirstIndex + 10),
  );
  return [song1Beats[song1Transition], song2Beats[song2FirstIndex]];
};

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
