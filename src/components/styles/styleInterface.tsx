interface metaData {
  themeName: string;
  themeDesc: string;
  themeAuthor: string;
  themeIcon: string;
  darkTheme: boolean;
}

interface customColors {
  maskedBackgroundColor: string;
  playlistDrawerBackgroundColor: string;
  playlistDrawerBackgroundColorTransparent: string;
  progressThumbTintColor: string;
  progressMinimumTrackTintColor: string;
  progressMaximumTrackTintColor: string;
}

export default interface style {
  metaData: metaData;

  gifs: Array<string>;
  backgroundImages: Array<string>;
  colors: any;
  customColors: customColors;
  // https://callstack.github.io/react-native-paper/docs/components/IconButton/
  // Type: 'outlined' | 'contained' | 'contained-tonal'
  playerControlIconContained: string;
}
