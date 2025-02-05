import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import useSnack from '@stores/useSnack';
import { ActionType, SponsorBlockBili } from '@utils/sponsorblock/Constants';
import useNoxSetting from '@stores/useApp';
import { getSponsorBlock } from '@utils/sponsorblock/parser';

export default () => {
  const setSnack = useSnack(state => state.setSnack);
  const { t } = useTranslation();
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const [sponsorBlock, setSponsorBlock] = useState<SponsorBlockBili[]>([]);

  const initSponsorBlock = (song: NoxMedia.Song) => {
    if (playerSetting.sponsorBlockEnabled) {
      getSponsorBlock(song).then(setSponsorBlock);
    }
  };

  const checkSponsorBlock = (position: number) => {
    for (const sb of sponsorBlock) {
      if (
        playerSetting.sponsorBlockCat.includes(sb.category) &&
        sb.actionType === ActionType.Skip &&
        position > sb.segment[0] &&
        position < sb.segment[1]
      ) {
        setSnack({
          snackMsg: {
            success: t('SponsorBlock.SkipMsg', {
              category: t(`SponsorBlock.${sb.category}`),
            }),
          },
        });
        return sb.segment[1];
      }
    }
    return undefined;
  };

  return { initSponsorBlock, checkSponsorBlock };
};
