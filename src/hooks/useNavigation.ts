import useNoxMobile from '@stores/useMobile';
import { useNavigation } from '@react-navigation/native';

import { NoxRoutes } from '@enums/Routes';
import { IconMap } from '@enums/BottomTab';

interface NavigateProps {
  route: NoxRoutes;
  setIcon?: boolean;
  options?: any;
}

export default () => {
  const navigationGlobal = useNavigation();
  const setRoute = useNoxMobile(state => state.setBottomTabRoute);

  const navigate = ({ route, setIcon = true, options }: NavigateProps) => {
    // @ts-expect-error nav v7 hasnt fixed this type yet
    navigationGlobal.navigate(route as never, options);
    if (setIcon) {
      setRoute(IconMap[route]);
    }
  };

  const navigate2 = (route: unknown) =>
    navigationGlobal.navigate(route as never);

  return { navigate, navigate2, getState: navigationGlobal.getState };
};
