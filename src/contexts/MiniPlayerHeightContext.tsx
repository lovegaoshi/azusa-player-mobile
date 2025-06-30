import { createContext, ReactNode, useContext } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';

const MiniPlayerHeightContext = createContext<SharedValue<number> | null>(null);

export const MiniPlayerHeightProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const insets = useSafeAreaInsets();
  const dim = Dimensions.get('window');
  const miniPlayerHeight = useSharedValue(
    dim.height + insets.top + insets.bottom,
  );

  return (
    <MiniPlayerHeightContext.Provider value={miniPlayerHeight}>
      {children}
    </MiniPlayerHeightContext.Provider>
  );
};

export const useMiniplayerHeight = () => {
  const context = useContext(MiniPlayerHeightContext);
  if (!context) {
    throw new Error(
      '[APMContext] useMiniplayerHeight must be used within APMProvider',
    );
  }
  return context;
};
