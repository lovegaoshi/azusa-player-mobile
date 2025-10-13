import React from 'react';
import { IconButton } from 'react-native-paper';
import { TrueSheet } from '@lodev09/react-native-true-sheet';

import { NoxSheetRoutes } from '@enums/Routes';

interface Props {
  disabled?: boolean;
}

export default function PlaylistMenuButton({ disabled = false }: Props) {
  return (
    <IconButton
      icon={'dots-horizontal'}
      onPress={() => TrueSheet.present(NoxSheetRoutes.PlaylistMenuSheet)}
      size={25}
      disabled={disabled}
      //iconColor={playerStyle.colors.primary}
    />
  );
}
