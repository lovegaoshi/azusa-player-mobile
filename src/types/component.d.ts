import { StyleProp, ViewStyle } from 'react-native';
import { ParamListBase, Theme } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Track } from 'react-native-track-player';
import { SharedValue } from 'react-native-reanimated';

import { IntentData } from '@enums/Intent';

declare global {
  namespace NoxComponent {
    interface AppThemeProps {
      defaultTheme: any;
      defaultNavTheme: Theme;
    }

    interface OpacityProps {
      opacity: SharedValue<number>;
      style?: StyleProp<ViewStyle>;
    }
    interface MiniplayerProps {
      miniplayerHeight: SharedValue<number>;
    }
    interface AppProps {
      intentData?: IntentData;
      intentAction: string;
      intentBundle: null | any;
      rootTag: number;
    }
    interface SetupPlayerProps extends AppProps {
      vip?: boolean;
    }
    interface NavigationProps {
      navigation: DrawerNavigationProp<ParamListBase>;
    }

    interface StackNavigationProps {
      navigation: NativeStackNavigationProp<ParamListBase>;
    }

    interface NavigationProps2 {
      navigation?: DrawerNavigationProp<ParamListBase>;
    }

    interface TrackProps {
      track?: Track;
    }
    type ViewStyleProp = StyleProp<ViewStyle>;
  }
  namespace NoxSyncComponent {
    interface ImportProps {
      restoreFromUint8Array: (data: Uint8Array) => Promise<void>;
      noxRestore: () => Promise<any>;
      login: (
        callback: () => any,
        errorHandling: (e: Error) => void,
      ) => Promise<boolean>;
    }

    interface ExportProps {
      noxBackup: (content: Uint8Array) => Promise<any>;
      login: (
        callback: () => any,
        errorHandling: (e: Error) => void,
      ) => Promise<boolean>;
    }

    interface Props {
      restoreFromUint8Array: (data: Uint8Array) => Promise<void>;
      noxRestore: () => Promise<any>;
      noxBackup: (content: Uint8Array) => Promise<any>;
      login: (
        callback: () => any,
        errorHandling: (e: Error) => void,
      ) => Promise<boolean>;
    }

    interface GenericProps {
      restoreFromUint8Array: (data: Uint8Array) => Promise<void>;
    }
  }
}
