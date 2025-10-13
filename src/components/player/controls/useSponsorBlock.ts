import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import useSnack from '@stores/useSnack';
import { ActionType, SponsorBlockBili } from '@utils/sponsorblock/Constants';
import useNoxSetting from '@stores/useApp';
import { getSponsorBlock } from '@utils/sponsorblock/parser';
import logger from '@utils/Logger';

interface SponsorBlockState {
  songid: string;
  sponsorBlock: SponsorBlockBili[];
}

export default function useSponsorBlock() {
  const setSnack = useSnack(state => state.setSnack);
  const { t } = useTranslation();
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const [sponsorBlock, setSponsorBlock] = useState<SponsorBlockState>();

  const initSponsorBlock = (song: NoxMedia.Song) => {
    if (playerSetting.sponsorBlockEnabled) {
      logger.debug(`[SponsorBlock] init for ${song.name}`);
      getSponsorBlock(song).then(sponsorBlock =>
        setSponsorBlock({ songid: song.id, sponsorBlock }),
      );
    }
  };

  const checkSponsorBlock = (position: number, songid: string) => {
    if (songid !== sponsorBlock?.songid) return undefined;
    for (const sb of sponsorBlock?.sponsorBlock ?? []) {
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
}
