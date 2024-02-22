import * as React from 'react';
import { Menu } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { Platform, NativeModules } from 'react-native';

import { SEARCH_OPTIONS } from '@enums/Storage';
import { MUSICFREE } from '@utils/mediafetch/musicfree';
import ICONS from './Icons';
import { useNoxSetting } from '@stores/useApp';
import { rgb2Hex } from '@utils/Utils';
import logger from '@utils/Logger';
import { probeMetadata } from '@utils/ffmpeg/ffmpeg';

const { NoxAndroidAutoModule } = NativeModules;

interface Props {
  visible?: boolean;
  toggleVisible?: () => void;
  menuCoords?: NoxTheme.coordinates;
  showMusicFree?: boolean;
}

export default ({
  visible = false,
  toggleVisible = () => undefined,
  menuCoords = { x: 0, y: 0 },
  showMusicFree,
}: Props) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const setSearchOption = useNoxSetting(state => state.setSearchOption);
  const setDefaultSearch = (defaultSearch: SEARCH_OPTIONS | MUSICFREE) => {
    toggleVisible();
    setSearchOption(defaultSearch);
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
      <Menu.Item
        leadingIcon={() => ICONS.LOCAL(rgb2Hex(playerStyle.colors.primary))}
        onPress={async () => {
          let selectedFile = (
            await DocumentPicker.getDocumentAsync({
              copyToCacheDirectory: false,
              type: 'audio/*',
            })
          ).assets;
          if (!selectedFile) return;
          // TODO: he.decode?
          let uri = selectedFile[0].uri;
          logger.debug(`[DocumentPicker] selected uri: ${uri}`);
          // content://com.android.externalstorage.documents/document/primary%3AMusic%2FTttt%2FGggg.mp3
          let parsedURI = uri
            .substring(uri.indexOf('%3A') + 3, uri.lastIndexOf('%2F'))
            .replaceAll('%2F', '/');
          let mediaFiles = await NoxAndroidAutoModule.listMediaDir(
            parsedURI,
            true
          );
          mediaFiles.forEach((v: any) => probeMetadata(v.realPath));
          return;
        }}
        title={'Local'}
      />
    </Menu>
  );
};
