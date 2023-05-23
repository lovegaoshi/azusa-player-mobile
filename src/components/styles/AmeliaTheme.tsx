export default {
  metaData: {
    themeName: '电闹播放器',
    themeDesc: '关注生草精灵诺莺Nox直播间 282208!',
    themeAuthor: 'lovegaoshi@github',
    themeIcon:
      'https://i1.hdslb.com/bfs/face/aeeae5b4ca9105419f562a105e6513249f9e30db.jpg',
    darkTheme: true,
  },

  gifs: [
    'https://walfiegif.files.wordpress.com/2022/03/out-transparent.gif',
    'https://walfiegif.files.wordpress.com/2022/01/out-transparent-2.gif',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/ameJAM.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/popcorn.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/fast.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/party.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/celebration.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/bee.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/example.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/tap_tap.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/cake.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/cooking_simulator.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/bongo.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/camera.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/portal.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/crunchy_marshmallow.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/ukulele_practice.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/reading.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/ground_pound.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/driving.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/rolling.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/she_appears.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/delicious_tears.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/controller_smash.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/this_is_true.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/wide.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/minecraft_rap.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/gold_mining.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/spicy_noodles.gif?raw=true',
    'https://github.com/jonowo/walfie-gif-dl/blob/main/gifs/sand.gif?raw=true',
    'https://i.kym-cdn.com/photos/images/original/002/075/486/1a8.gif',
  ],
  backgroundImages: [
    // https://www.zerochan.net/Watson+Amelia+Ch.?q=Watson+Amelia+Ch.&p=3
    'https://cdn.donmai.us/original/ea/ec/__nox_nijisanji_and_3_more_drawn_by_netural__eaec50f6d554b731ffe4fcace255d0bd.png',
  ],

  customColors: {
    // background color for any screens OTHER THAN the main player screen.
    // should have a low transparency to make text reading easier.
    // note its transparency STACKS with colors.background
    maskedBackgroundColor: 'rgba(0, 0, 0, 0.60)',
    // playlist background when selected. should be the contrast color of the primary text color.
    playlistDrawerBackgroundColor: 'green',
    // playlist background when selected. should be the contrast color of the primary text color.
    playlistDrawerBackgroundColorTransparent: 'rgba(0, 255, 0, 0.35)',
    // progress bar's round icon color.
    progressThumbTintColor: 'rgb(235, 235, 0)',
    // progresss bar's whatever's left of the round icon
    progressMinimumTrackTintColor: 'rgb(235, 235, 0)',
    // progresss bar's whatever's right of the round icon
    progressMaximumTrackTintColor: '#FFFFFF',
    btnBackgroundColor: 'rgb(72, 71, 58)',
    textInputSelectionColor: 'green',
  },

  colors: {
    primary: 'rgb(255, 255, 0)',
    onPrimary: 'rgb(50, 50, 0)',
    primaryContainer: 'rgb(73, 73, 0)',
    onPrimaryContainer: 'rgb(234, 234, 0)',
    secondary: 'rgb(202, 200, 165)',
    onSecondary: 'rgb(50, 50, 24)',
    secondaryContainer: 'rgb(73, 72, 45)',
    onSecondaryContainer: 'rgb(231, 228, 191)',
    tertiary: 'rgb(164, 208, 189)',
    onTertiary: 'rgb(11, 55, 42)',
    tertiaryContainer: 'rgb(37, 78, 64)',
    onTertiaryContainer: 'rgb(191, 236, 216)',
    error: 'rgb(255, 180, 171)',
    onError: 'rgb(105, 0, 5)',
    errorContainer: 'rgb(147, 0, 10)',
    onErrorContainer: 'rgb(255, 180, 171)',
    // IMPORTANT! use some transparency value if you are specifying a background image.
    background: 'rgba(0,0,0, 0.4)',
    onBackground: 'rgb(230, 226, 217)',
    surface: 'rgb(28, 28, 23)',
    // font color
    onSurface: 'rgba(235, 235, 0, 1)', // 'rgb(230, 226, 217)',
    // navigation text color. should be primary.
    text: 'rgb(255, 255, 0)',
    // blackground of inputs
    surfaceVariant: 'rgb(10, 10, 10)',
    // icon color
    onSurfaceVariant: 'rgb(225, 225, 0)', // 'rgb(202, 199, 182)',
    outline: 'rgb(147, 145, 130)',
    outlineVariant: 'rgb(72, 71, 58)',
    shadow: 'rgb(0, 0, 0)',
    scrim: 'rgb(0, 0, 0)',
    inverseSurface: 'rgb(230, 226, 217)',
    inverseOnSurface: 'rgb(49, 49, 43)',
    inversePrimary: 'rgb(98, 98, 0)',
    elevation: {
      level0: 'transparent',
      level1: 'rgb(53, 56, 57)',
      // menu
      level2: 'rgb(10, 10, 10)',
      // dialog
      level3: 'rgb(10, 10, 10)',
      level4: 'rgb(49, 49, 20)',
      level5: 'rgb(53, 53, 20)',
    },
    surfaceDisabled: 'rgba(230, 226, 217, 0.12)',
    onSurfaceDisabled: 'rgba(230, 226, 217, 0.38)',
    backdrop: 'rgba(49, 49, 37, 0.4)',
  },
  playerControlIconContained: 'contained',
} as NoxTheme.style;
