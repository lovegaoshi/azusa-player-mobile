// Credits to @matewka: https://snack.expo.dev/@matewka/react-native-paper-snackbar-problem
import * as React from 'react';
import { Snackbar, Portal, ActivityIndicator } from 'react-native-paper';

import useSnack, { InfiniteDuration } from '@stores/useSnack';
import { useNoxSetting } from '@stores/useApp';
import { CombinedDarkTheme, CombinedDefaultTheme } from '../styles/Theme';
import { useColorScheme } from 'react-native';
import logger from '@utils/Logger';

const Loading = () => <ActivityIndicator />;

export default function SnackBar() {
  const { snackMsg, snackDuration, snackVisible, snackOnDismiss } = useSnack();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const persisting = snackDuration === InfiniteDuration;

  const colorScheme = useColorScheme();

  const snackTheme = () => {
    logger.error(
      `snacktheme: ${colorScheme}, ${JSON.stringify(CombinedDarkTheme)}, ${JSON.stringify(CombinedDefaultTheme)},${playerStyle.metaData.darkTheme}`,
    );
    switch (colorScheme) {
      case 'dark':
        return CombinedDarkTheme;
      case 'light':
        return CombinedDefaultTheme;
      default:
        return playerStyle.metaData.darkTheme
          ? CombinedDarkTheme
          : CombinedDefaultTheme;
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
