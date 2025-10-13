// monitors drawer position and manages bottom tab routes.
import { useDrawerStatus } from '@react-navigation/drawer';
import useNoxMobile from '../stores/useMobile';
import { useLazyEffect } from '../utils/useLazyEffect';

export default function useAPMDrawerStatus() {
  const isDrawerOpen = useDrawerStatus() === 'open';
  const toggleDrawer = useNoxMobile(state => state.toggleBottomTabDrawer);

  useLazyEffect(() => toggleDrawer(isDrawerOpen), [isDrawerOpen]);

  return {};
}
