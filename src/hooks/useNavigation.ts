import { useNoxSetting } from '@stores/useApp';
import { useNavigation } from '@react-navigation/native';

import { NoxRoutes } from '@enums/Routes';
import { IconMap } from '@enums/BottomTab';

export default () => {
  const navigationGlobal = useNavigation();
  const setRoute = useNoxSetting(state => state.setBottomTabRoute);

  const navigate = (route: NoxRoutes, setIcon = true) => {
    navigationGlobal.navigate(route as never);
    if (setIcon) {
      setRoute(IconMap[route]);
    }
  };
  return { navigate };
};
