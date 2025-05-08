import { useEffect, useState } from 'react';
import TrackPlayer from 'react-native-track-player';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';

import { SetupService, additionalPlaybackService } from 'services';
import { initPlayerObject } from '@utils/ChromeStorage';
import { getCurrentTPQueue, initializePlaybackMode } from '@stores/playingList';
import useVersionCheck from '@hooks/useVersionCheck';
import { songlistToTracklist } from '@utils/RNTPUtils';
import { initializeStores } from '@stores/initializeStores';
import { IntentData } from '@enums/Intent';
import { useNoxSetting } from '@stores/useApp';
import usePlayStore from './usePlayStore';
import { buildBrowseTree } from '@utils/automotive/androidAuto';
import { NativeModules } from 'react-native';
import useActiveTrack, { useTrackStore } from './useActiveTrack';
import migrations from '../../drizzle/migrations';
import sqldb from '../utils/db/sql';
import logger from '@utils/Logger';

const { NoxModule } = NativeModules;

const initializePlayer = async (safeMode = false) => {
  await migrate(sqldb, migrations);
  const {
    playlists,
    currentPlayingID,
    storedPlayerSetting,
    lastPlayDuration,
    playbackMode,
  } = await initializeStores({ val: await initPlayerObject(safeMode) });
  const serviceOptions = {
    noInterruption: storedPlayerSetting.noInterruption,
    keepForeground: storedPlayerSetting.keepForeground,
    lastPlayDuration,
    currentPlayingID,
    parseEmbeddedArtwork: storedPlayerSetting.parseEmbeddedArtwork,
    crossfade: storedPlayerSetting.crossfade,
    eqPreset: storedPlayerSetting.eqPreset,
    loudnessEnhance: storedPlayerSetting.loudnessEnhance,
  };
  await SetupService(serviceOptions);
  buildBrowseTree(playlists);
  initializePlaybackMode(playbackMode);

  const currentQueue = getCurrentTPQueue();
  const findCurrentSong = currentQueue.find(val => val.id === currentPlayingID);
  if (findCurrentSong) {
    await TrackPlayer.add(await songlistToTracklist([findCurrentSong]));
  } else {
    currentQueue[0] &&
      (await TrackPlayer.add(await songlistToTracklist([currentQueue[0]])));
    serviceOptions.lastPlayDuration = 0;
  }
  await additionalPlaybackService(serviceOptions);
  return storedPlayerSetting;
};

export const appStartupInit = initializePlayer();

export default ({ intentData, vip }: NoxComponent.SetupPlayerProps) => {
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const { updateVersion, checkVersion } = useVersionCheck();
  const setIntentData = useNoxSetting(state => state.setIntentData);
  const { checkPlayStoreUpdates } = usePlayStore();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _activeTrack = useActiveTrack();
  const setTrack = useTrackStore(state => state.setTrack);

  useEffect(() => {
    let unmounted = false;
    (async () => {
      const isRNLoaded = await NoxModule?.isRNLoaded?.();
      if (!vip) {
        NoxModule?.loadRN?.();
      }
      await appStartupInit;
      const storedPlayerSetting =
        intentData === IntentData.SafeMode
          ? await initializePlayer(true)
          : await appStartupInit;
      updateVersion(storedPlayerSetting);
      checkVersion(true, storedPlayerSetting);
      setTrack(await TrackPlayer.getActiveTrack());
      // activity is already loaded. this indicates a GC induced JS crash
      // or last exit reason is ApplicationExitInfo.REASON_SIGNALED (2)
      // for Samsung S21
      const GCCrash = isRNLoaded && !__DEV__;
      const OSkill = (await NoxModule?.getLastExitCode?.()) === 2;
      if (GCCrash || OSkill) {
        await TrackPlayer.play();
        logger.error(`[APMReplay] detected ${GCCrash} and ${OSkill}!`);
      }
      if (unmounted) return;
      setPlayerReady(true);
      if (unmounted) return;
      checkPlayStoreUpdates();
      setIntentData(intentData);
      switch (intentData) {
        case IntentData.Resume:
          await TrackPlayer.play();
          break;
        case IntentData.PlayAll:
          // this hook cannot use usePlayback bc of rerendering..??
          break;
        case undefined:
          await TrackPlayer.pause();
          break;
        default:
        // await TrackPlayer.pause();
      }
    })();
    return () => {
      unmounted = true;
    };
  }, []);

  useEffect(() => {
    // HACK: fix when starting via notification clicks, loadRN is not set yet
    playerReady && NoxModule?.loadRN();
  }, [playerReady]);

  return playerReady;
};
