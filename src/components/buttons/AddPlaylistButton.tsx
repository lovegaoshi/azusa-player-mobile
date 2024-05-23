import React, { useImperativeHandle, useState } from "react";
import { IconButton } from "react-native-paper";
import Dialog from "../dialogs/NewPlaylistDialog";

const ICON = "plus-circle-outline";

interface Props {
  fromList?: NoxMedia.Playlist;
  icon?: string;
  // TODO: really object?
  style?: object;
}

export interface AddPlaylistButtonRef {
  setOpen: () => void;
}

export default React.forwardRef(
  ({ fromList, icon = ICON, style = {} }: Props, ref) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    useImperativeHandle(ref, () => ({ setOpen: () => setDialogOpen(true) }), [
      dialogOpen,
    ]);

    return (
      <React.Fragment>
        <IconButton
          icon={icon}
          onPress={() => setDialogOpen(true)}
          style={style}
        />
        <Dialog
          visible={dialogOpen}
          fromList={fromList}
          onClose={() => setDialogOpen(false)}
          onSubmit={() => setDialogOpen(false)}
        />
      </React.Fragment>
    );
  },
);
