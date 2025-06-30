import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export default {
  metaData: {
    themeName: 'AzusaClassic',
    themeDesc: 'plain solid color',
    themeAuthor: 'lovegaoshi@github',
    themeIcon: '',
    darkTheme: false,
  },

  gifs: [],
  backgroundImages: [],
  backgroundImagesLandscape: [],
  customColors: {
    maskedBackgroundColor: 'rgba(255, 255, 255, 0.5)',
    playlistDrawerBackgroundColor: '#dcd0ff',
    playlistDrawerBackgroundColorTransparent: 'rgba(234, 221, 255, 0.35)',
    progressThumbTintColor: '#a76bcf',
    progressMinimumTrackTintColor: '#df73ff',
    progressMaximumTrackTintColor: '#bf94e4',
    textInputSelectionColor: '#dcd0ff',
    playerControlIconBkgrdColor: '#dcd0ff',
  },
  colors: {
    karaokeOn: 'rgba(103, 80, 164, 1)',
    karaokeOff: '#c0bdc4',
    ...MD3LightTheme.colors,
    // background: 'rgba(255, 255, 255, 0.4)',
  },
  playerControlIconContained: undefined,
  isAdaptive: true,
  darkTheme: {
    ...MD3DarkTheme,
    metaData: {
      themeName: 'AzusaClassic',
      themeDesc: 'plain solid color',
      themeAuthor: 'lovegaoshi@github',
      themeIcon: '',
      darkTheme: true,
    },

    gifs: [],
    backgroundImages: [],
    backgroundImagesLandscape: [],
    customColors: {
      maskedBackgroundColor: 'rgba(0, 0, 0, 0.5)',
      playlistDrawerBackgroundColor: 'rgba(79, 55, 139, 1)',
      playlistDrawerBackgroundColorTransparent: 'rgba(79, 55, 139, 0.25)',
      progressThumbTintColor: 'rgba(208, 188, 255, 1)',
      progressMinimumTrackTintColor: 'rgba(208, 188, 255, 1)',
      progressMaximumTrackTintColor: '#bf94e4',
    },
    colors: {
      karaokeOn: 'rgba(208, 188, 255, 1)',
      karaokeOff: 'rgba(83, 79, 89, 1)',
      ...MD3DarkTheme.colors,
      // background: 'rgba(255, 255, 255, 0.4)',
    },
    playerControlIconContained: undefined,
  },
} as unknown as NoxTheme.Style;
