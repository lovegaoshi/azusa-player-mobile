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
import { buildBrowseTree } from './usePlaybackAA';

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

export default ({ intentData }: NoxComponent.AppProps) => {
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const { updateVersion, checkVersion } = useVersionCheck();
  const setIntentData = useNoxSetting(state => state.setIntentData);
  const { checkPlayStoreUpdates } = usePlayStore();

  useEffect(() => {
    let unmounted = false;
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
      switch (intentData) {
        case IntentData.Resume:
          await TrackPlayer.play();
          break;
        case IntentData.PlayAll:
          // this hook cannot use usePlayback bc of rerendering..??
          break;
        default:
          await TrackPlayer.pause();
      }
    })();
    return () => {
      unmounted = true;
    };
  }, []);
  return playerReady;
};
