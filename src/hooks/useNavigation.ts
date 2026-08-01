import useNoxMobile from '@stores/useMobile';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationHelpers } from '@react-navigation/drawer/lib/typescript/src/types';

import { NoxRoutes } from '@enums/Routes';
import { IconMap } from '@enums/BottomTab';

interface NavigateProps {
  route: NoxRoutes;
  setIcon?: boolean;
  options?: { merge?: boolean; pop?: boolean };
  params?: any;
}

export default function useAPMNavigation(navigation?: DrawerNavigationHelpers) {
  // HACK: what is this???
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const navigationGlobal = (navigation ?? useNavigation())!;
  const setRoute = useNoxMobile(state => state.setBottomTabRoute);

  const navigate = ({
    route,
    setIcon = true,
    options = { pop: true },
    params,
  }: NavigateProps) => {
    navigationGlobal.navigate(route, params, options);
    if (setIcon) {
      setRoute(IconMap[route]);
    }
    if (route === NoxRoutes.PlaylistsDrawer) {
      navigation?.openDrawer();
    } else {
      navigation?.closeDrawer();
    }
  };

  const navigate2 = (route: string) =>
    navigationGlobal.navigate(route, undefined, undefined);

  return { navigate, navigate2, getState: navigationGlobal.getState };
}
