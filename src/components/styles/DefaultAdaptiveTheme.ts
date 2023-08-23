import AzusaTheme from './AzusaTheme';
import NoxTheme from './NoxTheme';

const DefaultAdaptiveTheme: NoxTheme.AdaptiveStyle = {
  ...AzusaTheme,
  isAdaptive: true,
  darkTheme: {
    ...NoxTheme,
    metadata: {
      ...AzusaTheme.metaData,
      themeName: 'AzusaNox Theme',
      themeDesc: 'Adaptive Theme combining Nox and Azusa themes',
    },
  },
  metaData: {
    ...AzusaTheme.metaData,
    themeName: 'AzusaNox Theme',
    themeDesc: 'Adaptive Theme combining Nox and Azusa themes',
  },
};

export default DefaultAdaptiveTheme;
