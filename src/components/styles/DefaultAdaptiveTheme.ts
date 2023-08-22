import AzusaTheme from './AzusaTheme';
import NoxTheme from './NoxTheme';

const DefaultAdaptiveTheme: NoxTheme.AdaptiveStyle = {
  ...AzusaTheme,
  isAdaptive: true,
  darkTheme: NoxTheme,
};

export default DefaultAdaptiveTheme;
