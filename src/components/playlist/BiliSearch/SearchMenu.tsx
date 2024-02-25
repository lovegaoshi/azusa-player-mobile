import * as React from 'react';
import { Menu } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { Platform, NativeModules } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SEARCH_OPTIONS } from '@enums/Storage';
import { MUSICFREE } from '@utils/mediafetch/musicfree';
import ICONS from './Icons';
import { useNoxSetting } from '@stores/useApp';
import { rgb2Hex } from '@utils/Utils';

const { NoxAndroidAutoModule } = NativeModules;

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
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const setSearchOption = useNoxSetting(state => state.setSearchOption);
  const setDefaultSearch = (defaultSearch: SEARCH_OPTIONS | MUSICFREE) => {
    toggleVisible();
    setSearchOption(defaultSearch);
  };
  const chooseLocalFolder = async () => {
    const selectedFile = (
      await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: false,
        type: 'audio/*',
      })
    ).assets;
    if (!selectedFile) return;
    const uri = selectedFile[0].uri;
    const parsedURI = decodeURIComponent(
      uri.substring(uri.lastIndexOf('%3A') + 3)
    );
    if (Number.isNaN(Number.parseInt(parsedURI))) {
      setSearchVal(
        `local://${parsedURI.substring(0, parsedURI.lastIndexOf('/'))}`
      );
    } else {
      const mediaFiles = await NoxAndroidAutoModule.listMediaFileByID(
        uri.substring(uri.lastIndexOf('%3A') + 3)
      );
      setSearchVal(`local://${mediaFiles[0].relativePath}`);
    }
    toggleVisible();
  };

  return (
    <Menu visible={visible} onDismiss={toggleVisible} anchor={menuCoords}>
      <Menu.Item
        leadingIcon={ICONS.BILIBILI}
        onPress={() => setDefaultSearch(SEARCH_OPTIONS.BILIBILI)}
        title={'Bilibili'}
      />
      <Menu.Item
        leadingIcon={ICONS.YOUTUBE}
        onPress={() => setDefaultSearch(SEARCH_OPTIONS.YOUTUBE)}
        title={'Youtube'}
      />
      {showMusicFree && (
        <Menu.Item
          leadingIcon={ICONS.MUSICFREE}
          onPress={() => setDefaultSearch(MUSICFREE.aggregated)}
          title={`MusicFree.${MUSICFREE.aggregated}`}
        />
      )}
      {Platform.OS === 'android' && (
        <Menu.Item
          leadingIcon={() => ICONS.LOCAL(rgb2Hex(playerStyle.colors.primary))}
          onPress={chooseLocalFolder}
          title={t('Menu.local')}
        />
      )}
    </Menu>
  );
};
