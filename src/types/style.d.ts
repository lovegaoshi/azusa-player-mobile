declare namespace NoxTheme {
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
    btnBackgroundColor: string;
    textInputSelectionColor: string;
  }

  export interface backgroundImage {
    type: string;
    identifier: string;
  }

  export interface style {
    metaData: metaData;

    gifs: Array<string>;
    backgroundImages: Array<string | backgroundImage>;
    colors: any;
    customColors: customColors;
    // https://callstack.github.io/react-native-paper/docs/components/IconButton/
    // Type: 'outlined' | 'contained' | 'contained-tonal'
    playerControlIconContained: string | undefined;
  }

  export interface coordinates {
    x: number;
    y: number;
  }
}
