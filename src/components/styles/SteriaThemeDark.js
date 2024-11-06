export default {
  metaData: {
    themeName: 'VV播放器（暗）',
    themeDesc: '温柔 安定 直播间22924075',
    themeAuthor: '薇薇单推人@b站',
    themeIcon:
      'https://i2.hdslb.com/bfs/face/b70f6e62e4582d4fa5d48d86047e64eb57d7504e.jpg',
    darkTheme: true,
  },

  gifs: [
    'https://article.biliimg.com/bfs/article/313c42ec86c5bdaa13ba3d8a5633e696bfd2412f.gif',
    'https://article.biliimg.com/bfs/article/f961bb02daccadcc19daf191e5540e633fe4b104.gif',
    'https://article.biliimg.com/bfs/article/5fb01231dff56e8b089126c6edfa6fc68c7b2be7.gif',
    'https://article.biliimg.com/bfs/article/8dc01b02cd7dfeb8871dea607b4f191a5be80f64.gif',
    'https://i0.hdslb.com/bfs/garb/e0434d5ee3ad0be34377ac0df78a6075cabf34e8.png',
    'https://i0.hdslb.com/bfs/garb/e4bc12886185357562cd59d8d18257a8ad19d9e1.png',
    'https://i0.hdslb.com/bfs/garb/9cf9238d185de745850b6b7c0468bb0654e9c30e.png',
    'https://i0.hdslb.com/bfs/garb/e16087b121cb48dd34bab5a02ffc5601149b5ca4.png',
    'https://i0.hdslb.com/bfs/garb/802462836f55a35bf09d6ad00e4ba52ed101d2f6.png',
    'https://i0.hdslb.com/bfs/garb/22113e3f01f64e781754bf1297d3d201fb97a92c.png',
    'https://i0.hdslb.com/bfs/garb/bf79e7b0df21f7a75a640ca5a6e76c9ed687acd3.png',
    'https://i0.hdslb.com/bfs/garb/f4d9ae969e692ea086a4382698cf78f651bbc975.png',
    'https://i0.hdslb.com/bfs/garb/c2d0bac0d3d98b3424cd58d6e68d79bd352359f6.png',
    'https://i0.hdslb.com/bfs/garb/2cceff64dab9ab0d1ec389bda04655390fe4aea4.png',
    'https://i0.hdslb.com/bfs/garb/ec5cc3729cffbfd6acafa9f6c7b9171f585299e3.png',
    'https://i0.hdslb.com/bfs/garb/74bbe0803168dc873a7e97334b0bab85d337a39c.png',
  ],
  backgroundImages: [
    'https://i0.hdslb.com/bfs/new_dyn/344ceb5ad5145571272b5f7f31797924355610.png',
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
    primary: '#fcf75e',
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
    text: '#fcf75e',
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
  playerControlIconContained: undefined,
};
