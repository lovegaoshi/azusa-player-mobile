import React from 'react';
import { IconButton } from 'react-native-paper';
import { ViewStyle } from 'react-native';

import Dialog from '../dialogs/NewPlaylistDialog';
import { useNoxSetting } from '@stores/useApp';

const ICON = 'plus-circle-outline';

interface Props {
  fromList?: NoxMedia.Playlist;
  icon?: string;
  style?: ViewStyle;
  open: boolean;
  setOpen: (v: boolean) => void;
}

export default function AddPlaylistButton({
  fromList,
  icon = ICON,
  style = {},
  open,
  setOpen,
}: Props) {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <React.Fragment>
      <IconButton
        icon={icon}
        onPress={() => setOpen(true)}
        style={style}
        iconColor={playerStyle.colors.primary}
      />
      <Dialog
        visible={open}
        fromList={fromList}
        onClose={() => setOpen(false)}
        onSubmit={() => setOpen(false)}
      />
    </React.Fragment>
  );
}
