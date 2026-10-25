import React from 'react';
import TrackPlayer, {
  PlaybackProgressUpdatedEvent,
  PlaybackActiveTrackChangedEvent,
  Track,
} from 'react-native-track-player';

import { useNoxSetting } from '@stores/useApp';
import { performSkipToNext, prepareSkipToNext } from '@hooks/useTPControls';
import { saveLastPlayDuration } from '@utils/ChromeStorage';
import { logger } from '@utils/Logger';
import appStore, { setCurrentPlaying, setCrossfaded } from '@stores/appStore';
import noxPlayingList, { playNextIndex } from '@stores/playingList';
import { NoxRepeatMode } from '@enums/RepeatMode';
import { getR128Gain, getABRepeatNormalized } from '@utils/db/sqlAPI';
import { useTrackStore } from '@hooks/useActiveTrack';
import { execWhenTrue, r128gain2Volume } from '@utils/Utils';
import { getNextSong } from '@utils/RNTPUtils';
import { TPSeek } from '@stores/RNObserverStore';
import { setResumePlayback } from '@utils/db/sqlStorage';
import { eventListeners, Events } from './events';

const { getState } = noxPlayingList;
const { fadeIntervalMs, fadeIntervalSec } = appStore.getState();

interface OnAPMProgress {
  event: PlaybackProgressUpdatedEvent;
  playmode: NoxRepeatMode;
  playingList: NoxMedia.Song[];

  track?: Track;
  sbSkip?: number;
  resumePlayback: boolean;
  playerSetting: NoxStorage.PlayerSettingDict;
  crossfadeId: string;
  setCrossfadeId: (id: string) => void;
  setBRepeatDuration: (val: number) => void;
  abRepeat: [number, number, number?, number?];
  setSkipARepeat: (val: boolean) => void;
  bRepeatDuration: number;
  crossfadingId: string;
  setCrossfadingId: (id: string) => void;
  prepareSkipToNext: (set?: boolean) => Promise<NoxMedia.Song | undefined>;
  performSkipToNext: (auto?: boolean) => void;
}
export const onAPMProgress = async ({
  event,
  sbSkip,
  track,
  playmode,
  playingList,
  resumePlayback,
  playerSetting,
  crossfadeId,
  setCrossfadeId,
  setBRepeatDuration,
  abRepeat,
  setSkipARepeat,
  bRepeatDuration,
  crossfadingId,
  setCrossfadingId,
  prepareSkipToNext,
  performSkipToNext,
}: OnAPMProgress) => {
  saveLastPlayDuration(event.position);
  const currentSongId = track?.song?.id ?? '';
  resumePlayback && setResumePlayback(currentSongId, event.position);
  if (sbSkip) {
    return TPSeek(sbSkip);
  }

  // prepare for cross fading if enabled, playback is > 50% done and crossfade preparation isnt done
  if (
    playerSetting.crossfade > 0 &&
    event.position > event.duration * 0.5 &&
    crossfadeId !== currentSongId
  ) {
    logger.debug(
      `[crossfade] preparing crossfade at ${event.position}/${event.duration}`,
    );
    setCrossfadeId(currentSongId);
    setBRepeatDuration(event.duration * abRepeat[1]);
    const nextSong = await prepareSkipToNext(false);

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
  if (event.duration > 0 && playmode !== NoxRepeatMode.RepeatTrack) {
    const trueDuration = Math.min(bRepeatDuration, event.duration);
    if (
      // crossfade req: position is at crossfade interval,
      // crossfade song prepared, not in crossfading
      playerSetting.crossfade > 0 &&
      event.position > trueDuration - playerSetting.crossfade &&
      crossfadeId === currentSongId &&
      // enable crossfade on playlist size = 1 (repeatTrack without repeatTrack)
      (crossfadingId !== currentSongId || playingList.length === 1)
    ) {
      const nextSong = await getNextSong();
      const r128gain = await getR128Gain(nextSong.id);
      logger.debug(
        `[crossfade] crossfading: ${event.position}, ${trueDuration}, ${playerSetting.crossfade} to ${nextSong.name} @ ${r128gain}`,
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
      event.position > trueDuration - fadeIntervalSec &&
      crossfadeId !== currentSongId
    ) {
      logger.debug(
        `[FADEOUT] fading out....${event.position} / ${event.duration}`,
      );
      TrackPlayer.setAnimatedVolume({
        volume: 0,
        duration: fadeIntervalMs,
      });
    }
  }
  if (abRepeat[1] === 1) return;
  if (event.position > bRepeatDuration) {
    if (playmode === NoxRepeatMode.RepeatTrack) {
      TPSeek(abRepeat[0] * event.duration);
      return;
    }
    logger.debug(`[ABRepeat] duration ${event.duration} > ${bRepeatDuration}.`);
    performSkipToNext(true);
  }
};

interface OnAPMPlaybackActiveTrackChanged {
  event: PlaybackActiveTrackChangedEvent;
  initSponsorBlock?: (song: NoxMedia.Song) => void;
  setABRepeat: (val: [number, number, number?, number?]) => void;
  loadingTracker?: React.RefObject<boolean>;
  resumePlayback: boolean;
  setBRepeatDuration: (val: number) => void;
}

export const onAPMPlaybackActiveTrackChanged = async ({
  event,
  initSponsorBlock,
  setABRepeat,
  loadingTracker,
  resumePlayback,
  setBRepeatDuration,
}: OnAPMPlaybackActiveTrackChanged) => {
  const song = event.track?.song as NoxMedia.Song;
  initSponsorBlock?.(song);
  const newABRepeat = await getABRepeatNormalized(song.id);
  logger.debug(`[SongReady] logging ABRepeat as ${newABRepeat}`);
  setABRepeat([newABRepeat.a, newABRepeat.b]);
  if (setCurrentPlaying(song) && !loadingTracker?.current) return;
  if (loadingTracker) {
    loadingTracker.current = false;
  }
  execWhenTrue({
    loopCheck: async () => (await TrackPlayer.getProgress()).duration !== 0,
    executeFn: async () => {
      const trackDuration = (await TrackPlayer.getProgress()).duration;
      setBRepeatDuration(newABRepeat.b * trackDuration);
      const trackSeekTo =
        resumePlayback && newABRepeat.resumePlayback !== -1
          ? newABRepeat.resumePlayback
          : trackDuration * newABRepeat.a;
      if (trackSeekTo === 0) return;
      logger.debug(`[ABRepeat] skipping forward to ${trackSeekTo}`);
      TPSeek(trackSeekTo);
    },
    funcName: 'ABRepeat A seek',
  });
};

export const APMProgressCallback = async (
  event: PlaybackProgressUpdatedEvent,
) => {
  const {
    resumePlayback,
    playerSetting,
    crossfadeId,
    setCrossfadeId,
    setBRepeatDuration,
    abRepeat,
    setSkipARepeat,
    bRepeatDuration,
    crossfadingId,
    setCrossfadingId,
    hookLoaded,
  } = useNoxSetting.getState();
  if (hookLoaded) {
    logger.debug('[APMListener] hook is loaded. removing listener...');
    return eventListeners[Events.ProgressUpdated]?.remove();
  }
  const { playmode, playingList } = getState();
  const track = useTrackStore.getState().track;
  onAPMProgress({
    event,
    playmode,
    playingList,
    track,
    resumePlayback,
    playerSetting,
    crossfadeId,
    setCrossfadeId,
    setBRepeatDuration,
    abRepeat,
    setSkipARepeat,
    bRepeatDuration,
    crossfadingId,
    setCrossfadingId,
    prepareSkipToNext: set => prepareSkipToNext(undefined, set),
    performSkipToNext: auto => performSkipToNext(undefined, auto),
  });
};

export const APMPlaybackActiveTrackChangedCallback = async (
  event: PlaybackActiveTrackChangedEvent,
) => {
  const { resumePlayback, setBRepeatDuration, setABRepeat } =
    useNoxSetting.getState();
  onAPMPlaybackActiveTrackChanged({
    event,
    setABRepeat,
    resumePlayback,
    setBRepeatDuration,
  });
};
