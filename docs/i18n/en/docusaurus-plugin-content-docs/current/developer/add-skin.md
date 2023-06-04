---
sidebar_position: 2
---

# Add New Skins

## Asset Data Structure

APM enables user-defined skin files specified as JSON. One may simply upload JSON files onto github and use the rawgithubcontent URL to load into APM. to develop your own skin, you may use `steria.json` as the template. One thing to note is to **NOT USE HTTP, ONLY HTTPS**. You may specify the following properties:

### `metaData`

This will show up in the skin selection page, declared as `NoxTheme.metaData`.

### `gifs`

This is an array of URLs that serves as emoticons at the top position of the front page.

### `backgroundImages`

This is an array of background image URI sources. it can simply be a string that serves as a static image, or an object as `NoxTheme.backgroundImage`. It has two fields: `type` and `identifier`. This is resolved by `resolveBackgroundImage` in `MainBackground.tsx`. Ultimately this is resolved into either a video or an image, with `identifier` as the actual source URI. bilibili video id is built in to resolve any bilibili video as the background. steria.json has an example of this.

### `customColors`

This is declared as `NoxTheme.customColors`.

```
// background color for any screens OTHER THAN the main player screen.
// should have a low transparency to make text reading easier.
// note its transparency STACKS with colors.background
maskedBackgroundColor: 'rgba(0, 0, 0, 0.60)',
// playlist background when selected. should be the contrast color of the primary text color.
playlistDrawerBackgroundColor: 'green',
// playlist background when selected. should be the contrast color of the primary text color. This has a transparency with it.
playlistDrawerBackgroundColorTransparent: 'rgba(0, 255, 0, 0.35)',
// progress bar's round icon color.
progressThumbTintColor: 'rgb(235, 235, 0)',
// progresss bar's whatever's left of the round icon
progressMinimumTrackTintColor: 'rgb(235, 235, 0)',
// progresss bar's whatever's right of the round icon
progressMaximumTrackTintColor: '#FFFFFF',
// background color for buttons.
btnBackgroundColor: 'rgb(72, 71, 58)',
// background color for selecting texts. recommends to be the contrast color of primary color.
textInputSelectionColor: 'green',
```

### `colors`

## Use Bilibili Garb Assets

see this [issue](https://github.com/lovegaoshi/azusa-player-mobile/issues/60).
