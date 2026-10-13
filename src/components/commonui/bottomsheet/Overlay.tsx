import { Platform, Modal } from 'react-native';
import { FullWindowOverlay } from 'react-native-screens';

/**
 * overlay modals/dialogs on top of true-sheet.
 * https://sheet.lodev09.com/guides/overlays
 */

export const Overlay = Platform.select({
  ios: FullWindowOverlay,
  // @ts-expect-error
  default: Modal,
});

interface Props extends React.PropsWithChildren {
  visible?: boolean;
}

export default (p: Props) => (
  // @ts-expect-error
  <Overlay visible={p.visible} transparent>
    {p.children}
  </Overlay>
);
