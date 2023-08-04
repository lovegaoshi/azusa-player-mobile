import * as React from 'react';
import { Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { SEARCH_OPTIONS } from '@enums/Storage';
import { saveDefaultSearch } from '@utils/ChromeStorage';

enum ICONS {
  BILIBILI = 'cog',
  YOUTUBE = 'magnify-plus',
}

interface Props {
  visible?: boolean;
  toggleVisible?: () => void;
  menuCoords?: NoxTheme.coordinates;
}

export default ({
  visible = false,
  toggleVisible = () => undefined,
  menuCoords = { x: 0, y: 0 },
}: Props) => {
  const { t } = useTranslation();

  const setDefaultSearch = (defaultSearch: SEARCH_OPTIONS) => {
    toggleVisible();
    saveDefaultSearch(defaultSearch);
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
    </Menu>
  );
};
