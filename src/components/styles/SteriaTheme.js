// eslint-disable-next-line node/no-unsupported-features/es-syntax
export default {
  metaData: {
    themeName: 'guraaaaaa',
    themeDesc: 'A',
    themeAuthor: 'lovegaoshi',
    themeIcon: 'https://pbs.twimg.com/media/FLLR87OakAAs3Li.jpg',
    darkTheme: false,
  },

  gifs: [
    'http://i0.hdslb.com/bfs/live/e8073adeb52036d0d563c848c4b55b8449bc4b85.png',
    'http://i0.hdslb.com/bfs/live/f2a7a0916015a741a192ae85ee593a39c6dd04a7.png',
    'http://i0.hdslb.com/bfs/live/0a691aec40c738918014b27acfefa3b295b8a458.png',
    'http://i0.hdslb.com/bfs/live/cdb1f3adeee987c1fe5303ca90443932edb23d30.png',
    'http://i0.hdslb.com/bfs/live/c9450e570d7abcf5a920b65e18b9624b75c9d4fb.png',
    'http://i0.hdslb.com/bfs/live/021761abdfe8dc417e5267b74877bebd43dcfd58.png',
    'http://i0.hdslb.com/bfs/live/e0ae55eb80c6b7c01eeb042a26a3bd2938ed679a.png',
    'http://i0.hdslb.com/bfs/live/bea985bcf662dc4d85c9f78633c57398b7c3d223.png',
    'http://i0.hdslb.com/bfs/live/5b29c4c15e6b97da2df564899f84906fc800590b.png',
    'http://i0.hdslb.com/bfs/live/a9fa62db7b7233dac30d3abd851b992710bc1649.png',
  ],
  backgroundImages: [
    {
      type: 'bvid',
      identifier: 'BV1gc411A7zR',
    },
  ],

  customColors: {
    // background color for any screens OTHER THAN the main player screen.
    // should have a low transparency to make text reading easier.
    // note its transparency STACKS with colors.background
    maskedBackgroundColor: 'rgba(255, 255, 255, 0.40)',
    // playlist background when selected. should be the contrast color of the primary text color.
    playlistDrawerBackgroundColor: '#FFDA1F',
    // playlist background when selected. should be the contrast color of the primary text color.
    playlistDrawerBackgroundColorTransparent: 'rgba(255, 166, 201, 0.35)',
    // progress bar's round icon color.
    progressThumbTintColor: '#1e90ff',
    // progresss bar's whatever's left of the round icon
    progressMinimumTrackTintColor: '#1e90ff',
    // progresss bar's whatever's right of the round icon
    progressMaximumTrackTintColor: '#FFFFFF',
  },

  colors: {
    text: '#1e90ff',
    primary: '#1e90ff',
    onPrimary: 'rgb(255, 255, 255)',
    primaryContainer: 'rgb(255, 217, 223)',
    onPrimaryContainer: 'rgb(63, 0, 22)',
    secondary: '#00aaff',
    onSecondary: 'rgb(255, 255, 255)',
    secondaryContainer: 'rgb(255, 217, 223)',
    onSecondaryContainer: 'rgb(43, 21, 26)',
    tertiary: 'rgb(122, 87, 50)',
    onTertiary: 'rgb(255, 255, 255)',
    tertiaryContainer: 'rgb(255, 220, 188)',
    onTertiaryContainer: 'rgb(44, 23, 0)',
    error: 'rgb(186, 26, 26)',
    onError: 'rgb(255, 255, 255)',
    errorContainer: 'rgb(255, 218, 214)',
    onErrorContainer: 'rgb(65, 0, 2)',
    background: 'rgba(255, 251, 255, 0.3)',
    onBackground: '#1e90ff',
    surface: 'rgb(255, 251, 255)',
    onSurface: '#1e90ff',
    surfaceVariant: 'rgba(255, 251, 255, 0.2)',
    onSurfaceVariant: '#1e90ff',
    outline: 'rgb(132, 115, 117)',
    outlineVariant: 'rgb(214, 194, 196)',
    shadow: 'rgba(0, 0, 0)',
    scrim: 'rgb(0, 0, 0)',
    inverseSurface: 'rgb(54, 47, 48)',
    inverseOnSurface: 'rgb(250, 238, 238)',
    inversePrimary: 'rgb(255, 177, 192)',
    elevation: {
      level0: 'transparent',
      level1: 'rgb(250, 242, 247)',
      level2: 'rgb(247, 236, 242)',
      level3: 'rgb(244, 230, 237)',
      level4: 'rgb(243, 229, 235)',
      level5: 'rgb(241, 225, 232)',
    },
    surfaceDisabled: 'rgba(32, 26, 27, 0.12)',
    onSurfaceDisabled: 'rgba(32, 26, 27, 0.38)',
    backdrop: 'rgba(58, 45, 47, 0.4)',
  },
  playerControlIconContained: undefined,
};
