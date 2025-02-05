import { useEffect, useState } from 'react';
import TrackPlayer from 'react-native-track-player';

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
import sqlMigrate from '@utils/sqlMigrate';

const { NoxModule } = NativeModules;

const initializePlayer = async (safeMode = false) => {
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
    if (!vip) {
      NoxModule?.loadRN();
    }
    let unmounted = false;
    sqlMigrate();
    (async () => {
      await appStartupInit;
      const storedPlayerSetting =
        intentData === IntentData.SafeMode
          ? await initializePlayer(true)
          : await appStartupInit;
      updateVersion(storedPlayerSetting);
      checkVersion(true, storedPlayerSetting);
      if (unmounted) return;
      setPlayerReady(true);
      if (unmounted) return;
      checkPlayStoreUpdates();
      setIntentData(intentData);
      setTrack(await TrackPlayer.getActiveTrack());
      if (!(await TrackPlayer.validateOnStartCommandIntent())) {
        TrackPlayer.play();
      } else {
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
