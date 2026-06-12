import {
  StyleProp,
  ViewStyle,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { ParamListBase, Theme } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Track } from 'react-native-track-player';
import { SharedValue } from 'react-native-reanimated';
import { ActivityIndicatorProps as _ActivityIndicatorProps } from 'react-native-paper/';

import { IntentData } from '@enums/Intent';

declare global {
  namespace NoxComponent {
    interface ActivityIndicatorProps extends _ActivityIndicatorProps {
      wavy?: boolean;
      trackColor?: string;
    }
    interface ScrollableProps {
      onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
      onMomentumScrollEnd?: (
        e: NativeSyntheticEvent<NativeScrollEvent>,
      ) => void;
    }
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
      intentCategories: string[] | null | undefined;
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
    interface ImportProps extends GenericProps {
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

    interface Props extends GenericProps {
      noxRestore: () => Promise<any>;
      noxBackup: (content: Uint8Array) => Promise<any>;
      login: (
        callback: () => any,
        errorHandling: (e: Error) => void,
      ) => Promise<boolean>;
    }

    interface GenericProps {
      restoreFromUint8Array: (data: Uint8Array<ArrayBuffer>) => Promise<void>;
    }
  }
}
