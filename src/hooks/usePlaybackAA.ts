import { Platform } from 'react-native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import usePlayback from './usePlayback';
import { useNoxSetting } from '@stores/useApp';
import { IntentData } from '@enums/Intent';
import usePlaybackCarplay from './usePlaybackCarplay';
import { buildBrowseTree } from '@utils/automotive/androidAuto';

export const useAndroidAuto = () => {
  const { t } = useTranslation();
  const playlists = useNoxSetting(state => state.playlists);

  return { buildBrowseTree: () => buildBrowseTree(playlists, t) };
};

const useAndroidAutoListener = () => {
  const { shuffleAll } = usePlayback();
  const { buildBrowseTree } = useAndroidAuto();
  const intentData = useNoxSetting(state => state.intentData);
  const setIntentData = useNoxSetting(state => state.setIntentData);

  useEffect(() => {
    // HACK: for some reason I decided to register AA related listeners here.
    // I need the intent shuffleall handling somewhere it only runs once, which
    // is here... but this looks BAD.
    if (intentData === IntentData.PlayAll) {
      shuffleAll();
      setIntentData();
    }
  }, []);

  // HACK: this looks very stupid but AAPlaybackListener needs buildBrowseTree, PlayFromMediaID, etc.
  // so might as well pass this off from AAPlaybackListener to register the listeners and use buildBrowseTree
  // two birds in one stone.
  return { buildBrowseTree };
};

export default () => {
  switch (Platform.OS) {
    case 'android':
      return useAndroidAutoListener();
    case 'ios':
      return usePlaybackCarplay();
    default:
      throw new Error('unsupported platform');
  }
};
