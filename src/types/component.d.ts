import { ParamListBase } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

declare global {
  namespace NoxComponent {
    interface NavigationProps {
      navigation: DrawerNavigationProp<ParamListBase>;
    }
    interface NavigationProps2 {
      navigation?: DrawerNavigationProp<ParamListBase>;
    }
  }
}
