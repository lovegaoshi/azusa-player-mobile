/* eslint-disable @typescript-eslint/no-explicit-any */
import { StyleSheet } from 'react-native';
import { colord } from 'colord';

import NoxTheme from './styles/NoxTheme';
import AzusaTheme from './styles/AzusaTheme';
import { randomChoice } from '@utils/Utils';
import logger from '@utils/Logger';

export const createStyle = (
  customStyle: NoxTheme.Style | NoxTheme.AdaptiveStyle = AzusaTheme,
) => {
  const refTheme = customStyle.metaData.darkTheme ? NoxTheme : AzusaTheme;
  return StyleSheet.create({
    metaData: {
      ...refTheme.metaData,
      // HACK: sure its bad but works.
      ...((customStyle.metaData ?? {}) as any),
    },
    colors: {
      ...refTheme.colors,
      ...(customStyle.colors ?? refTheme.colors),
    },

    customColors: {
      ...refTheme.customColors,
      ...((customStyle.customColors ?? {}) as any),
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
      height: 148,
    },
    gifs: (customStyle.gifs || []) as any,
    bkgrdImg: randomChoice(customStyle.backgroundImages || []) as any,
    bkgrdImgLandscape: randomChoice(
      customStyle.backgroundImagesLandscape || [],
    ) as any,
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

const validateColors = (colors: string[]) =>
  colors.every(color => colord(color).isValid());

interface ReplaceStyleColor {
  playerStyle: NoxTheme.Style;
  primaryColor?: string;
  secondaryColor?: string;
  contrastColor?: string;
  backgroundColor?: string;
  noWeeb?: boolean;
}

export const replaceStyleColor = ({
  playerStyle,
  primaryColor = playerStyle.colors.primary,
  secondaryColor = playerStyle.colors.secondary,
  contrastColor = playerStyle.customColors.playlistDrawerBackgroundColor,
  backgroundColor = playerStyle.colors.background,
  noWeeb = false,
}: ReplaceStyleColor) => {
  if (
    !validateColors([
      primaryColor,
      secondaryColor,
      contrastColor,
      backgroundColor,
    ])
  ) {
    logger.error('[color converter] color invalid');
    return playerStyle;
  }
  const replacedStyle = {
    ...playerStyle,
    customColors: {
      ...playerStyle.customColors,
      playlistDrawerBackgroundColor: contrastColor,
      textInputSelectionColor: contrastColor,
      progressThumbTintColor: primaryColor,
      progressMinimumTrackTintColor: primaryColor,
    },
    colors: {
      ...playerStyle.colors,
      primary: primaryColor,
      secondary: secondaryColor,
      background: backgroundColor,
      onSurface: primaryColor,
      onSurfaceVariant: secondaryColor,
      text: primaryColor,
    },
  };
  return noWeeb
    ? {
        ...replacedStyle,
        gifs: [],
        backgroundImages: [],
        backgroundImagesLandscape: [],
        bkgrdImg: '',
        bkgrdImgLandscape: '',
        loadingIcon: undefined,
        progressThumbImage: undefined,
        progressThumbImageLeftDrag: undefined,
        progressThumbImageRightDrag: undefined,
        biliGarbCard: undefined,
        thumbupSVGA: undefined,
      }
    : replacedStyle;
};

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  centeredFlex: {
    justifyContent: 'center',
    flex: 1,
  },
  centerText: { textAlign: 'center' },
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
    height: 148,
  },
  rowView: { flexDirection: 'row' },
  alignMiddle: { justifyContent: 'center' },
  alignCenter: { alignItems: 'center' },
});

export const ItemSelectStyles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  skinItemContainer: {
    flexDirection: 'row',
  },
  skinItemLeftContainer: {
    flexDirection: 'row',
    paddingVertical: 5,
    flex: 5,
    paddingLeft: 5,
  },
  skinItemImage: {
    width: 72,
    height: 72,
    borderRadius: 40,
  },
  skinItemTextContainer: {
    paddingLeft: 5,
  },
  lightbulbContainer: {
    flexDirection: 'row',
  },
  lightbulbIcon: {
    marginHorizontal: 0,
    marginVertical: 0,
    marginLeft: -8,
    marginTop: -8,
  },
  skinItemRightContainer: {
    flexDirection: 'row',
    alignContent: 'flex-end',
  },
  deleteButton: {
    marginLeft: -3,
  },
  skinTitleText: {
    maxWidth: '90%',
  },
  radioButton: {
    paddingTop: 7,
  },
});
