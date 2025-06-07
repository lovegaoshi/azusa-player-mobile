// Credits to @matewka: https://snack.expo.dev/@matewka/react-native-paper-snackbar-problem
import * as React from 'react';
import { Snackbar, Portal, ActivityIndicator } from 'react-native-paper';

import useSnack, { InfiniteDuration } from '@stores/useSnack';
import { useNoxSetting } from '@stores/useApp';
import { CombinedDarkTheme, CombinedDefaultTheme } from '../styles/Theme';

const Loading = () => <ActivityIndicator />;

export default function SnackBar() {
  const { snackMsg, snackDuration, snackVisible, snackOnDismiss } = useSnack();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const persisting = snackDuration === InfiniteDuration;

  return (
    <Portal>
      <Snackbar
        theme={
          playerStyle.metaData.darkTheme
            ? CombinedDarkTheme
            : CombinedDefaultTheme
        }
        visible={snackVisible}
        onDismiss={snackOnDismiss}
        duration={snackDuration}
        icon={persisting ? Loading : undefined}
        onIconPress={persisting ? () => undefined : undefined}
      >
        {snackMsg}
      </Snackbar>
    </Portal>
  );
}
