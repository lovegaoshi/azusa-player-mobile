import * as React from 'react';
import { Menu } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { Platform, NativeModules } from 'react-native';

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
          console.log(await NoxAndroidAutoModule.listMediaDir('Music/', true));
          return;
          console.log(
            await DocumentPicker.getDocumentAsync({
              copyToCacheDirectory: false,
              type: 'audio/*',
            })
          );
        }}
        title={'Local'}
      />
    </Menu>
  );
};
