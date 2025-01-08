import * as React from 'react';
import { Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { SearchOptions } from '@enums/Storage';
import useAlert from '@components/dialogs/useAlert';
import Icons from './Icons';
import { useNoxSetting } from '@stores/useApp';
import { rgb2Hex } from '@utils/Utils';
import {
  isAndroid,
  chooseLocalMediaFolderAndroid,
  FilePickerResult,
} from '@utils/RNUtils';

interface Props {
  visible?: boolean;
  toggleVisible?: () => void;
  menuCoords?: NoxTheme.coordinates;
  showMusicFree?: boolean;
  setSearchVal: (v: string) => void;
}

export default ({
  visible = false,
  toggleVisible = () => undefined,
  menuCoords = { x: 0, y: 0 },
  showMusicFree,
  setSearchVal,
}: Props) => {
  const { t } = useTranslation();
  const { OneWayAlert } = useAlert();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const setSearchOption = useNoxSetting(state => state.setSearchOption);
  const setDefaultSearch = (defaultSearch: SearchOptions) => {
    toggleVisible();
    setSearchOption(defaultSearch);
  };
  const chooseLocalFolderAndroid = async () => {
    const location = await chooseLocalMediaFolderAndroid();
    switch (location.reason) {
      case FilePickerResult.NoPermission:
        OneWayAlert('dude', 'this aint gonna work without permissions');
        break;
      case FilePickerResult.Success:
        setSearchVal(`local://${location.relativePath}`);
    }
    toggleVisible();
  };

  return (
    <Menu visible={visible} onDismiss={toggleVisible} anchor={menuCoords}>
      <Menu.Item
        leadingIcon={() => Icons.BILIBILI()}
        onPress={() => setDefaultSearch(SearchOptions.BILIBILI)}
        title={'Bilibili'}
      />
      <Menu.Item
        leadingIcon={() => Icons.YOUTUBEM()}
        onPress={() => setDefaultSearch(SearchOptions.YOUTUBEM)}
        title={'YT Music'}
      />
      <Menu.Item
        leadingIcon={() => Icons.YOUTUBE()}
        onPress={() => setDefaultSearch(SearchOptions.YOUTUBE)}
        title={'Youtube'}
      />
      <Menu.Item
        leadingIcon={'google-cloud'}
        onPress={() => setDefaultSearch(SearchOptions.ALIST)}
        title={'AList'}
      />
      {showMusicFree && (
        <Menu.Item
          leadingIcon={Icons.MUSICFREE}
          onPress={() => setDefaultSearch(SearchOptions.MUSICFREE)}
          title={'MusicFree'}
        />
      )}
      {isAndroid && (
        <Menu.Item
          leadingIcon={() =>
            Icons.LOCAL(
              rgb2Hex(
                playerStyle.colors.onSurfaceVariant ??
                  playerStyle.colors.primary,
              ),
            )
          }
          onPress={chooseLocalFolderAndroid}
          title={t('Menu.local')}
        />
      )}
    </Menu>
  );
};
