import * as React from 'react';
import { Menu } from 'react-native-paper';

import { SEARCH_OPTIONS } from '@enums/Storage';
import { MUSICFREE } from '@utils/mediafetch/musicfree';
import ICONS from './Icons';
import { useNoxSetting } from '@stores/useApp';

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
    </Menu>
  );
};
