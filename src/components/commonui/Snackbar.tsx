// Credits to @matewka: https://snack.expo.dev/@matewka/react-native-paper-snackbar-problem
import * as React from 'react';
import { Snackbar, Portal, ActivityIndicator } from 'react-native-paper';
import { useColorScheme } from 'react-native';

import useSnack, { InfiniteDuration } from '@stores/useSnack';
import { useNoxSetting } from '@stores/useApp';
import { CombinedDarkTheme, CombinedDefaultTheme } from '../styles/Theme';

const Loading = () => <ActivityIndicator />;

export default function SnackBar() {
  const { snackMsg, snackDuration, snackVisible, snackOnDismiss } = useSnack();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const persisting = snackDuration === InfiniteDuration;

  const colorScheme = useColorScheme();

  // HACK: for whatever reason snackbar uses the inverseOnSurface; so this theme
  // has to be inversed to match the current theme
  const snackTheme = () => {
    switch (colorScheme) {
      case 'dark':
        return CombinedDefaultTheme;
      case 'light':
        return CombinedDarkTheme;
      default:
        return playerStyle.metaData.darkTheme
          ? CombinedDefaultTheme
          : CombinedDarkTheme;
    }
  };

  return (
    <Portal>
      <Snackbar
        theme={snackTheme()}
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
