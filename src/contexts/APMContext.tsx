import { ReactNode } from 'react';

import { MiniPlayerHeightProvider } from './MiniPlayerHeightContext';

export default ({ children }: { children: ReactNode }) => (
  <MiniPlayerHeightProvider>{children}</MiniPlayerHeightProvider>
);
