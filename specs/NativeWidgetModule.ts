import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  updateWidget: () => void;
  setWidgetBackground: (uri?: string) => void;
}

export default TurboModuleRegistry.get<Spec>('NativeWidgetModule');
