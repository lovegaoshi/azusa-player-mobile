import React, { useState } from 'react';
import { IconButton } from 'react-native-paper';
import Dialog from '../dialogs/GenericDialog';

const ICON = 'shuffle';

export default () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <React.Fragment>
      <IconButton
        icon={ICON}
        onPress={() => setDialogOpen(true)}
        mode="contained"
        size={30}
        style={{ top: 10 }}
      />
      <Dialog
        visible={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={() => setDialogOpen(false)}
      />
    </React.Fragment>
  );
};
