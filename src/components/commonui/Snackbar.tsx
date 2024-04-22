// Credits to @matewka: https://snack.expo.dev/@matewka/react-native-paper-snackbar-problem
import * as React from 'react';
import { Snackbar, Portal } from 'react-native-paper';

import useSnack from '@stores/useSnack';
import { useNoxSetting } from '@stores/useApp';

export default function SnackBar() {
  const { snackMsg, snackDuration, snackVisible, snackOnDismiss } = useSnack();
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <Portal>
      <Snackbar
        theme={{ dark: playerStyle.metaData.darkTheme }}
        visible={snackVisible}
        onDismiss={snackOnDismiss}
        duration={snackDuration}
      >
        {snackMsg}
      </Snackbar>
    </Portal>
  );
}
