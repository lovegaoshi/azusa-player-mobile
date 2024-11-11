import { useNoxSetting } from '@stores/useApp';
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
  const setRoute = useNoxSetting(state => state.setBottomTabRoute);

  const navigate = ({ route, setIcon = true, options }: NavigateProps) => {
    // @ts-expect-error nav v7 hasnt fixed this type yet
    navigationGlobal.navigate(route as never, options);
    if (setIcon) {
      setRoute(IconMap[route]);
    }
  };

  return { navigate, getState: navigationGlobal.getState };
};
