import { createContext, ReactNode, useContext } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

import { MinPlayerHeight } from '@components/miniplayer/Constants';

const MiniPlayerHeightContext = createContext<SharedValue<number> | null>(null);

export const MiniPlayerHeightProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const miniPlayerHeight = useSharedValue(MinPlayerHeight);

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
