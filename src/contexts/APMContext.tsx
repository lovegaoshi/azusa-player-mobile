import { PropsWithChildren } from 'react';

import { MiniPlayerHeightProvider } from './MiniPlayerHeightContext';

export default function APMContext({ children }: PropsWithChildren) {
  return <MiniPlayerHeightProvider>{children}</MiniPlayerHeightProvider>;
}
