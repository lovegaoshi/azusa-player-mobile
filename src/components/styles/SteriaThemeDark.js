export default {
  metaData: {
    themeName: '安妮播放器',
    themeDesc: '关注弃车人的骄傲你练直播间27484357',
    themeAuthor: '食梦莲lotus@bilibili',
    themeIcon:
      'https://i0.hdslb.com/bfs/face/81e39eb61a0cbefeb7a6647137167011a63e717f.jpg',
    darkTheme: false,
  },

  gifs: [
    'https://article.biliimg.com/bfs/article/313c42ec86c5bdaa13ba3d8a5633e696bfd2412f.gif',
    'https://article.biliimg.com/bfs/article/f961bb02daccadcc19daf191e5540e633fe4b104.gif',
    'https://article.biliimg.com/bfs/article/5fb01231dff56e8b089126c6edfa6fc68c7b2be7.gif',
    'https://article.biliimg.com/bfs/article/8dc01b02cd7dfeb8871dea607b4f191a5be80f64.gif',
    'http://i0.hdslb.com/bfs/garb/e0434d5ee3ad0be34377ac0df78a6075cabf34e8.png',
    'http://i0.hdslb.com/bfs/garb/e4bc12886185357562cd59d8d18257a8ad19d9e1.png',
    'http://i0.hdslb.com/bfs/garb/9cf9238d185de745850b6b7c0468bb0654e9c30e.png',
    'http://i0.hdslb.com/bfs/garb/e16087b121cb48dd34bab5a02ffc5601149b5ca4.png',
    'http://i0.hdslb.com/bfs/garb/802462836f55a35bf09d6ad00e4ba52ed101d2f6.png',
    'http://i0.hdslb.com/bfs/garb/22113e3f01f64e781754bf1297d3d201fb97a92c.png',
    'http://i0.hdslb.com/bfs/garb/bf79e7b0df21f7a75a640ca5a6e76c9ed687acd3.png',
    'http://i0.hdslb.com/bfs/garb/f4d9ae969e692ea086a4382698cf78f651bbc975.png',
    'http://i0.hdslb.com/bfs/garb/c2d0bac0d3d98b3424cd58d6e68d79bd352359f6.png',
    'http://i0.hdslb.com/bfs/garb/2cceff64dab9ab0d1ec389bda04655390fe4aea4.png',
    'http://i0.hdslb.com/bfs/garb/ec5cc3729cffbfd6acafa9f6c7b9171f585299e3.png',
    'http://i0.hdslb.com/bfs/garb/74bbe0803168dc873a7e97334b0bab85d337a39c.png',
  ],
  backgroundImages: [
    'https://koistatic.terrach.net/dbs-art/2022/08/20220824144703485.jpg',
  ],

  customColors: {
    // background color for any screens OTHER THAN the main player screen.
    // should have a low transparency to make text reading easier.
    // note its transparency STACKS with colors.background
    maskedBackgroundColor: 'rgba(255, 255, 255, 0.40)',
    // playlist background when selected. should be the contrast color of the primary text color.
    playlistDrawerBackgroundColor: '#ffa6c9',
    // playlist background when selected. should be the contrast color of the primary text color.
    playlistDrawerBackgroundColorTransparent: 'rgba(255, 166, 201, 0.35)',
    // progress bar's round icon color.
    progressThumbTintColor: '#ff1493',
    // progresss bar's whatever's left of the round icon
    progressMinimumTrackTintColor: '#ff1493',
    // progresss bar's whatever's right of the round icon
    progressMaximumTrackTintColor: '#FFFFFF',
  },

  colors: {
    text: '#ff1493',
    primary: '#ff1493',
    onPrimary: 'rgb(255, 255, 255)',
    primaryContainer: 'rgb(255, 217, 223)',
    onPrimaryContainer: 'rgb(63, 0, 22)',
    secondary: '#cc3366',
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
    onBackground: '#ff1493',
    surface: 'rgb(255, 251, 255)',
    onSurface: '#ff1493',
    surfaceVariant: 'rgb(243, 221, 224)',
    onSurfaceVariant: '#ff1493',
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
