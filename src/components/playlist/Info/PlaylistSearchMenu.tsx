import * as React from 'react';
import { Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { SearchRegex } from '@enums/Playlist';

interface Props {
  visible?: boolean;
  toggleVisible?: () => void;
  menuCoords?: NoxTheme.Coordinates;
  setSearchCategory: (category: string) => void;
}

export default function PlaylistSearchMenu({
  visible = false,
  toggleVisible = () => undefined,
  menuCoords = { x: 0, y: 0 },
  setSearchCategory,
}: Props) {
  const { t } = useTranslation();

  return (
    <Menu visible={visible} onDismiss={toggleVisible} anchor={menuCoords}>
      {Object.keys(SearchRegex).map((entry, index) => (
        <Menu.Item
          onPress={() => {
            setSearchCategory(SearchRegex[entry]?.text);
            toggleVisible();
          }}
          title={t(`PlaylistRegex.${entry}`)}
          key={entry}
        />
      ))}
    </Menu>
  );
}
