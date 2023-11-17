import Snackbar from 'react-native-snackbar';

import { logger } from './Logger';

interface ShowSnackbar {
  updating: string;
  updated: string;
  updateFail: string;
}
export const showSnackbar = async <T>(
  msg: ShowSnackbar,
  callback: () => Promise<T>
) => {
  try {
    Snackbar.show({
      text: msg.updating,
      duration: Snackbar.LENGTH_INDEFINITE,
    });
    const result = await callback();
    Snackbar.show({
      text: msg.updated,
    });
    return result;
  } catch (e) {
    logger.error(e);
    Snackbar.show({
      text: msg.updateFail,
    });
  }
};
