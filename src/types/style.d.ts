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
    playerControlIconContained?: string;
    // this is the URI of the loading icon in the playpause button, in place of an activityIndicator. its advised to set this because IOS
    // activity indicator is small as heck. any fun animated icon would be great.
    loadingIcon?: string;
    // this is the thumb image for the player control progress bar. maybe I should default it to bilibili's icon instead of a circle.
    progressThumbImage?: string;
    // TODO: unimplemented. this is the thumb image when dragged to the left.
    progressThumbImageLeftDrag?: string;
    progressThumbImageRightDrag?: string;
    // this is the imagebackground for the home button in the left drawer menu. I'm using the card asset in biliGarb which is roughly 4:1 landscape.
    biliGarbCard?: string;
  }

  export interface coordinates {
    x: number;
    y: number;
  }
}
