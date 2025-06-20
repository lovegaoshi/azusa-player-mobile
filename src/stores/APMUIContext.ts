import { createContext, ReactNode, createElement } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

import { MinPlayerHeight } from '@components/miniplayer/Constants';

const MiniPlayerHeightContext = createContext<SharedValue<number> | null>(null);

export const APMProvider = ({ children }: { children: ReactNode }) => {
  const miniPlayerHeight = useSharedValue(MinPlayerHeight);

  return (
    <MiniPlayerHeightContext.Provider value={{ miniPlayerHeight }}>
      {children}
    </MiniPlayerHeightContext.Provider>
  );
};
