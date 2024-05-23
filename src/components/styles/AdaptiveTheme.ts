import AzusaTheme from "./AzusaTheme";
import NoxTheme from "./NoxTheme";

const DefaultAdaptiveTheme: NoxTheme.AdaptiveStyle = {
  ...AzusaTheme,
  isAdaptive: true,
  darkTheme: {
    ...NoxTheme,
    metaData: {
      ...NoxTheme.metaData,
      themeName: "AzusaNox Theme",
      themeAuthor: "nek7mi",
      themeDesc: "Adaptive Theme combining Nox and Azusa themes",
    },
  },
  metaData: {
    ...AzusaTheme.metaData,
    themeName: "AzusaNox Theme",
    themeAuthor: "nek7mi",
    themeDesc: "Adaptive Theme combining Nox and Azusa themes",
  },
};

export default DefaultAdaptiveTheme;
