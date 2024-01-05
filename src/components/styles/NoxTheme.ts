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
    'https://i0.hdslb.com/bfs/new_dyn/697096d892a7193d33dbdc0edc5e2c9f5053504.gif',
    'https://i0.hdslb.com/bfs/new_dyn/d9f4d8ea6686304cefff9ce096f0f4135053504.gif',
    'https://i0.hdslb.com/bfs/new_dyn/2e678361788e9fd518fb47bc5ab15e8b5053504.gif',
    'https://i0.hdslb.com/bfs/new_dyn/26bcb47c59fb3d004bf0b93f6749da6f5053504.gif',
    'https://article.biliimg.com/bfs/article/2841b7662c4d6a32c3852f58b623e234f7f4e21a.gif',
    'https://article.biliimg.com/bfs/article/0290281b9aa9d28c522dfd8be3de4e0527eb7b2f.gif',
    'https://article.biliimg.com/bfs/article/4705df0a2f474fb37c0fbef7b68ad1efc17f47f0.gif',
    'https://article.biliimg.com/bfs/article/aac9820e8a7ef5cd6efcd929ea78bef141aadaa3.png',
    'https://article.biliimg.com/bfs/article/d52dd3ef32408d62a172d6834332a572af95a5bc.jpg',
    'https://article.biliimg.com/bfs/article/3f1fa01d6bb5f5874e7bfa91933bc5f19daf079b.jpg',
    'https://article.biliimg.com/bfs/article/a64a32a63ea592edaa7f3da0d48946d0487b8341.png',
    'https://i0.hdslb.com/bfs/garb/item/ed86d0550f84db69ee6db22eb21ff679df3b22f6.png',
    'https://i0.hdslb.com/bfs/garb/item/f3be20de809ac956f7324b95db58595dff378d38.png',
    'https://i0.hdslb.com/bfs/new_dyn/80bcfc0d0459868465ede9ffa0cc7f3c32898941.gif',
    'https://i0.hdslb.com/bfs/new_dyn/d15b52d2a64c99caaa594e0e9a8eae4d32898941.gif',
    'https://i0.hdslb.com/bfs/new_dyn/e8895104e4f298c620f58fe4f43ad59432898941.gif',
    'https://i0.hdslb.com/bfs/new_dyn/5f2a485ca7d29afd7263ad5f370092ca32898941.gif',
    'https://i0.hdslb.com/bfs/new_dyn/e8895104e4f298c620f58fe4f43ad59432898941.gif',
    'https://i0.hdslb.com/bfs/new_dyn/6b1ceba3f1c433d494c98ef9eeb71a5e32898941.gif',
    'https://i0.hdslb.com/bfs/new_dyn/0043f21652277aba43afb176fe60ba3132898941.png',
    'https://i0.hdslb.com/bfs/new_dyn/def78a8ec272a9485d01278eb8353d1632898941.png',
    'https://i0.hdslb.com/bfs/garb/item/8d26deac54428b567fb61be6198e601ea9a4622b.png',
  ],
  backgroundImages: [
    'https://i0.hdslb.com/bfs/new_dyn/2325a96b0d32e59f59a326f2398b5902529249.png',
    'https://cdn.donmai.us/original/ea/ec/__nox_nijisanji_and_3_more_drawn_by_netural__eaec50f6d554b731ffe4fcace255d0bd.png',
    'https://i0.hdslb.com/bfs/baselabs/f99bb1115aee11c0f939914529fb3d4b06eee485.png',
    {
      type: 'biliNFTVideo',
      identifier: '["102",18]',
    },
  ],
  backgroundImagesLandscape: [
    'http://i0.hdslb.com/bfs/live/room_bg/1428a93e4a983a7a6e7ba3dc62b064e403fc8354.png',
  ],

  customColors: {
    // background color for any screens OTHER THAN the main player screen.
    // should have a low transparency to make text reading easier.
    // note its transparency STACKS with colors.background
    maskedBackgroundColor: 'rgba(0, 0, 0, 0.50)',
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
    playerControlIconBkgrdColor: '#444444',
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
} as NoxTheme.Style;
