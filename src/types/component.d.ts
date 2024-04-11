import { StyleProp, ViewStyle } from 'react-native';
import { ParamListBase } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Track } from 'react-native-track-player';

import { IntentData } from '@enums/Intent';

declare global {
  namespace NoxComponent {
    interface AppProps {
      intentData?: IntentData;
    }
    interface NavigationProps {
      navigation: DrawerNavigationProp<ParamListBase>;
    }
    interface NavigationProps2 {
      navigation?: DrawerNavigationProp<ParamListBase>;
    }

    interface TrackProps {
      track?: Track;
    }
    type ViewStyleProp = StyleProp<ViewStyle>;
  }
}
