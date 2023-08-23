import { StyleSheet } from 'react-native';
import NoxTheme from './styles/NoxTheme';
import AzusaTheme from './styles/AzusaTheme';
import { randomChoice } from '../utils/Utils';

export const createStyle = (
  customStyle: NoxTheme.Style | NoxTheme.AdaptiveStyle = AzusaTheme
) => {
  const refTheme = customStyle.metaData.darkTheme ? NoxTheme : AzusaTheme;
  return StyleSheet.create({
    metaData: {
      ...refTheme.metaData,
      // HACK: sure its bad but works.
      ...((customStyle.metaData || {}) as any),
    },
    colors: {
      ...refTheme.colors,
      ...((customStyle.colors || refTheme.colors) as any),
    },

    customColors: {
      ...refTheme.customColors,
      ...((customStyle.customColors || {}) as any),
    },

    playerControlIconContained: customStyle.playerControlIconContained as any,

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
    gifs: (customStyle.gifs || []) as any,
    bkgrdImg: randomChoice(customStyle.backgroundImages || []) as any,
    loadingIcon: customStyle.loadingIcon as any,
    progressThumbImage: customStyle.progressThumbImage as any,
    progressThumbImageLeftDrag: (customStyle.progressThumbImageLeftDrag ||
      customStyle.progressThumbImage) as any,
    progressThumbImageRightDrag: (customStyle.progressThumbImageRightDrag ||
      customStyle.progressThumbImage) as any,
    biliGarbCard: customStyle.biliGarbCard as any,
    thumbupSVGA: customStyle.thumbupSVGA as any,
    thumbupZIndex: (Number.parseInt(String(customStyle.thumbupZIndex)) |
      0) as any,
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
  rowView: { flexDirection: 'row' },
});
