import React, { useState } from 'react';
import { IconButton } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import Dialog from '../dialogs/GenericDialog';

const ICON = 'shuffle';

export default function GenericButton() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <React.Fragment>
      <IconButton
        icon={ICON}
        onPress={() => setDialogOpen(true)}
        mode="contained"
        size={30}
        style={styles.btnStyle}
      />
      <Dialog
        visible={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={() => setDialogOpen(false)}
      />
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  btnStyle: {
    top: 10,
  },
});
