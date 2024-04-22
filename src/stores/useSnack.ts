import { logger } from '../utils/Logger';
import { create, useStore } from 'zustand';

interface SetSnack {
  snackMsg: { processing?: string; success: string; fail?: string };
  snackDuration?: number;
  onDismiss?: () => void;
  callback?: () => Promise<void>;
}
interface NoxSnack {
  snackMsg: string;
  snackVisible: boolean;
  snackDuration: number;
  snackOnDismiss: () => void;
  setSnack: ({}: SetSnack) => Promise<void>;
}
export default create<NoxSnack>(set => ({
  snackMsg: '',
  snackVisible: false,
  snackDuration: 3000,
  snackOnDismiss: () => set({ snackVisible: false }),
  setSnack: async ({
    snackMsg,
    snackDuration = 3000,
    onDismiss = () => void 0,
    callback,
  }) => {
    if (callback) {
      set({
        snackMsg: snackMsg.processing || 'processing...',
        snackVisible: true,
        snackDuration: 999999,
        snackOnDismiss: () => void 0,
      });
      try {
        await callback();
        set({ snackVisible: false });
        setTimeout(
          () =>
            set({
              snackMsg: snackMsg.success,
              snackVisible: true,
              snackDuration,
              snackOnDismiss: () => set({ snackVisible: false }),
            }),
          500
        );
      } catch (e) {
        logger.error(e);
        set({ snackVisible: false });
        setTimeout(
          () =>
            set({
              snackMsg: snackMsg.fail || 'failed...',
              snackVisible: true,
              snackDuration,
              snackOnDismiss: () => set({ snackVisible: false }),
            }),
          500
        );
      }
      return;
    }
    set({
      snackMsg: snackMsg.success,
      snackVisible: true,
      snackDuration,
      snackOnDismiss: () => {
        onDismiss();
        set({ snackVisible: false });
      },
    });
  },
}));
