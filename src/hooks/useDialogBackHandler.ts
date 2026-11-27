import { useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';

/**
 * Dismiss a dialog with Android's hardware back button or predictive back
 * gesture. Paper's Dialog has its own back handler, but dialogs rendered
 * through the native Modal-based Overlay can have the event consumed by the
 * overlay instead. Registering the dialog's own close handler here makes back
 * behave like pressing Cancel for every dialog.
 */
export default function useDialogBackHandler(
  visible: boolean,
  onDismiss: () => void,
) {
  // Keep the latest callback without re-registering the listener on every render.
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!visible) return;

    // BackHandler invokes listeners in reverse registration order and stops at
    // the first one returning true. This is registered after Paper's own
    // listener, so the dialog is dismissed exactly once.
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onDismissRef.current();
        return true;
      },
    );

    return () => subscription.remove();
  }, [visible]);
}
