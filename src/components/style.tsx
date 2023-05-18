import { StyleSheet } from 'react-native';
import NoxTheme from './styles/NoxTheme';
import AzusaTheme from './styles/AzusaTheme';
// this seems stupid, but it resolves tsc by some weird ways that i keep...
import { randomChoice } from '../utils/Utils';

const nd = (val: any, defaultVal: any) => {
  return val || defaultVal;
};

export const createStyle = (customStyle = AzusaTheme) => {
  const refTheme = customStyle.metaData.darkTheme ? NoxTheme : AzusaTheme;
  return StyleSheet.create({
    metaData: { ...refTheme.metaData, ...nd(customStyle.metaData, {}) },
    colors: { ...refTheme.colors, ...nd(customStyle.colors, refTheme.colors) },

    customColors: {
      ...refTheme.customColors,
      ...nd(customStyle.customColors, {}),
    },

    playerControlIconContained: nd(
      customStyle.playerControlIconContained,
      refTheme.playerControlIconContained
    ),

    screenContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentContainer: {
      flex: 6,
      alignItems: 'center',
    },
    playerTopBarContainer: {
      width: '100%',
      flexDirection: 'row',
      // paddingHorizontal: 20,
      justifyContent: 'flex-end',
      top: 7,
    },
    topBarContainer: {
      width: '100%',
      flexDirection: 'row',
      // paddingHorizontal: 20,
      paddingLeft: 10,
      paddingRight: 5,
      justifyContent: 'flex-end',
      top: 4,
    },
    actionRowContainer: {
      flexDirection: 'column',
      width: '100%',
      alignItems: 'center',
      height: 140,
    },
    gifs: nd(customStyle.gifs, refTheme.gifs),
    bkgrdImg: randomChoice(
      nd(customStyle.backgroundImages, refTheme.backgroundImages)
    ),
  });
};

export const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 6,
    alignItems: 'center',
  },
  topBarContainer: {
    width: '100%',
    flexDirection: 'row',
    // paddingHorizontal: 20,
    justifyContent: 'flex-end',
    top: 4,
  },
  actionRowContainer: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    height: 140,
  },
});
