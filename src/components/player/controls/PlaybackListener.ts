import TrackPlayer, { State } from 'react-native-track-player';

import { saveLastPlayDuration } from '@utils/ChromeStorage';
import { getR128Gain, getABRepeatNormalized } from '@utils/db/sqlAPI';
import { setResumePlayback } from '@utils/db/sqlStorage';
import { getNextSong } from '@utils/RNTPUtils';
import { r128gain2Volume } from '@utils/Utils';
import { logger } from '@utils/Logger';
import appStore, { setCrossfaded } from '@stores/appStore';
import noxPlayingList, { playNextIndex } from '@stores/playingList';
import { useNoxSetting } from '@stores/useApp';
import { useTrackStore } from '@hooks/useActiveTrack';
import { NoxRepeatMode } from '@enums/RepeatMode';
import { TPSeek } from '@stores/RNObserverStore';
import {
  performSkipToNext,
  prepareSkipToNext,
  skipToBiliSuggest,
} from '@hooks/useTPControls';
import { checkSponsorBlock } from './useSponsorBlock';

interface PlaybackProgress {
  position: number;
  duration: number;
}

const PROGRESS_POLL_INTERVAL_MS = 500;

let listening = false;

/**
 * handles a single playback progress update.
 * extracted from the PlaybackProgressUpdated event listener in usePlayerControls.
 */
export const playbackProgressListener = async ({
  position,
  duration,
}: PlaybackProgress) => {
  const { playmode, playingList } = noxPlayingList.getState();
  const {
    resumePlayback,
    playerSetting,
    crossfadeId,
    crossfadingId,
    abRepeat,
    bRepeatDuration,
    setCrossfadeId,
    setCrossfadingId,
    setBRepeatDuration,
    setSkipARepeat,
  } = useNoxSetting.getState();
  const { fadeIntervalMs, fadeIntervalSec } = appStore.getState();
  const currentSongId = useTrackStore.getState().track?.song?.id ?? '';

  saveLastPlayDuration(position);
  resumePlayback && setResumePlayback(currentSongId, position);

  const sbSkip = checkSponsorBlock(position, currentSongId);
  if (sbSkip) {
    return TPSeek(sbSkip);
  }
  // prepare for cross fading if enabled, playback is > 50% done and crossfade preparation isnt done
  if (
    playerSetting.crossfade > 0 &&
    position > duration * 0.5 &&
    crossfadeId !== currentSongId
  ) {
    logger.debug(`[crossfade] preparing crossfade at ${position}/${duration}`);
    setCrossfadeId(currentSongId);
    setBRepeatDuration(duration * abRepeat[1]);
    const nextSong = await prepareSkipToNext(skipToBiliSuggest, false);

    let arepeat = 0;
    if (nextSong) {
      const newABRepeat = await getABRepeatNormalized(nextSong.id);
      const absARepeat = Number(newABRepeat.aAbs);
      arepeat = Number.isNaN(absARepeat)
        ? newABRepeat.a * nextSong.duration
        : absARepeat;
      setSkipARepeat(true);
      logger.debug(`[crossfade] priming the fading player to ${arepeat}...`);
    }
    await TrackPlayer.crossFadePrepare(false, arepeat);
    return;
  }

  // if fade or crossfade should be triggered
  if (duration > 0 && playmode !== NoxRepeatMode.RepeatTrack) {
    const trueDuration = Math.min(bRepeatDuration, duration);
    if (
      // crossfade req: position is at crossfade interval,
      // crossfade song prepared, not in crossfading
      playerSetting.crossfade > 0 &&
      position > trueDuration - playerSetting.crossfade &&
      crossfadeId === currentSongId &&
      // enable crossfade on playlist size = 1 (repeatTrack without repeatTrack)
      (crossfadingId !== currentSongId || playingList.length === 1)
    ) {
      const nextSong = await getNextSong();
      const r128gain = await getR128Gain(nextSong.id);
      logger.debug(
        `[crossfade] crossfading: ${position}, ${trueDuration}, ${playerSetting.crossfade} to ${nextSong.name} @ ${r128gain}`,
      );
      setCrossfadingId(currentSongId);
      setCrossfadeId('');
      setCrossfaded(true);
      // HACK: manually update playing index.
      // this needs to be refactored at some point (eg setting index hooked inside useActiveTrack)
      playNextIndex({});
      resumePlayback && setResumePlayback(currentSongId, 0);
      return TrackPlayer.crossFade(
        playerSetting.crossfade * 1000,
        20,
        r128gain2Volume(r128gain ?? 0),
      );
    }
    if (
      // fade req: position is at fade interval, not in crossfading
      fadeIntervalSec > 0 &&
      position > trueDuration - fadeIntervalSec &&
      crossfadeId !== currentSongId
    ) {
      logger.debug(`[FADEOUT] fading out....${position} / ${duration}`);
      TrackPlayer.setAnimatedVolume({
        volume: 0,
        duration: fadeIntervalMs,
      });
    }
  }
  if (abRepeat[1] === 1) return;
  if (position > bRepeatDuration) {
    if (playmode === NoxRepeatMode.RepeatTrack) {
      TPSeek(abRepeat[0] * duration);
      return;
    }
    logger.debug(`[ABRepeat] duration ${duration} > ${bRepeatDuration}.`);
    performSkipToNext(true);
  }
};

/**
 * polls TrackPlayer's progress every 500ms and feeds it to playbackProgressListener,
 * substituting the PlaybackProgressUpdated event listener.
 */
export const startPlaybackProgressListener = async () => {
  if (listening) return;
  listening = true;
  logger.debug('[PlaybackListener] starting playback progress polling.');
  while (listening) {
    try {
      const { state } = await TrackPlayer.getPlaybackState();
      if (state === State.Playing) {
        const { position, duration } = await TrackPlayer.getProgress();
        await playbackProgressListener({ position, duration });
      }
    } catch (e) {
      logger.error(`[PlaybackListener] failed to poll progress: ${e}`);
    }
    await new Promise(resolve =>
      setTimeout(resolve, PROGRESS_POLL_INTERVAL_MS),
    );
  }
  logger.debug('[PlaybackListener] stopped playback progress polling.');
};

export const stopPlaybackProgressListener = () => {
  listening = false;
};
