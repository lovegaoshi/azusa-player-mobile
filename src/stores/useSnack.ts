import { logger } from '../utils/Logger';
import { create } from 'zustand';
import { timeout } from '../utils/Utils';

export interface SetSnack {
  snackMsg: { processing?: string; success: string; fail?: string };
  snackDuration?: number;
  onDismiss?: () => void;
  processFunction?: () => Promise<any>;
  callback?: () => void;
}

interface NoxSnack {
  snackMsg: string;
  snackVisible: boolean;
  snackDuration: number;
  snackType: SnackType;
  snackOnDismiss: () => void;
  setSnack: (v: SetSnack) => Promise<void>;
  snackDismiss: () => Promise<void>;
}

export const InfiniteDuration = 99999999;
export enum SnackType {
  Success = 'success',
  Fail = 'fail',
  Warn = 'warn',
  Processing = 'processing',
}

const useSnack = create<NoxSnack>((set, get) => ({
  snackMsg: 'The quick brown fox jumps over the lazy dog.',
  snackVisible: false,
  snackType: SnackType.Success,
  snackDuration: 3000,
  snackOnDismiss: () => set({ snackVisible: false }),
  snackDismiss: () => {
    set({ snackVisible: false });
    return timeout(100);
  },
  setSnack: async ({
    snackMsg,
    snackDuration = 3000,
    onDismiss = () => void 0,
    callback,
    processFunction,
  }) => {
    if (get().snackVisible) {
      set({ snackVisible: false });
      await timeout(100);
    }
    if (processFunction) {
      set({
        snackMsg: snackMsg.processing ?? 'processing...',
        snackVisible: true,
        snackDuration: InfiniteDuration,
        snackOnDismiss: () => void 0,
      });
      try {
        await processFunction();
        set({ snackVisible: false });
        setTimeout(
          () =>
            set({
              snackMsg: snackMsg.success,
              snackVisible: true,
              snackDuration,
              snackOnDismiss: () => set({ snackVisible: false }),
            }),
          800,
        );
      } catch (e) {
        logger.error(e);
        set({ snackVisible: false });
        setTimeout(
          () =>
            set({
              snackMsg: snackMsg.fail ?? 'failed...',
              snackVisible: true,
              snackDuration,
              snackOnDismiss: () => set({ snackVisible: false }),
            }),
          800,
        );
      }
      callback?.();
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

export const setSnackMsg = (msg: string) =>
  useSnack.getState().setSnack({
    snackMsg: { success: msg },
  });

export default useSnack;
