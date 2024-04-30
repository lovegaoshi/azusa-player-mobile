import { fetchVideoPlayUrl } from './bilivideo';
import { biliNFTVideoFetch } from './biliNFTNew';
import { biliNFTVideoFetch as biliNFTVideoFetchOld } from './biliNFT';
import { biliGarbHeadVideoFetch } from './biliGarb';
import { cacheWrapper } from '@utils/Cache';
import logger from '../Logger';

export enum RESOLVE_TYPE {
  bvid = 'bvid',
  video = 'video',
  biliNFTVideo = 'biliNFTVideo',
  biliNFTVideoNew = 'biliNFTVideoNew',
  biliGarbHeadVideo = 'biliGarbHeadVideo',
  image = 'image',
}

export default async (backgroundImage: string | NoxTheme.backgroundImage) => {
  if (typeof backgroundImage === 'string') {
    return { type: RESOLVE_TYPE.image, identifier: backgroundImage };
  }
  switch (backgroundImage.type) {
    case RESOLVE_TYPE.bvid:
      return {
        type: RESOLVE_TYPE.video,
        identifier: await cacheWrapper(
          `${RESOLVE_TYPE.bvid}-${backgroundImage.identifier}`,
          () => fetchVideoPlayUrl(backgroundImage.identifier)
        ),
      };
    case RESOLVE_TYPE.biliNFTVideo: {
      logger.warn(
        `[backgroundFetch] ${RESOLVE_TYPE.biliNFTVideo} is no longer supported.`
      );
      const [act_id, index] = JSON.parse(backgroundImage.identifier);
      return {
        type: RESOLVE_TYPE.video,
        identifier: await cacheWrapper(
          `${RESOLVE_TYPE.biliNFTVideoNew}-${backgroundImage.identifier}`,
          () => biliNFTVideoFetchOld({ act_id, index })
        ),
      };
    }
    case RESOLVE_TYPE.biliNFTVideoNew: {
      const [act_id, lottery_id, index] = JSON.parse(
        backgroundImage.identifier
      );
      return {
        type: RESOLVE_TYPE.video,
        identifier: await cacheWrapper(
          `${RESOLVE_TYPE.biliNFTVideoNew}-${backgroundImage.identifier}`,
          () => biliNFTVideoFetch({ act_id, lottery_id, index })
        ),
      };
    }
    case RESOLVE_TYPE.biliGarbHeadVideo:
      return {
        type: RESOLVE_TYPE.video,
        identifier: await cacheWrapper(
          `${RESOLVE_TYPE.biliGarbHeadVideo}-${backgroundImage.identifier}`,
          () =>
            biliGarbHeadVideoFetch({
              act_id: backgroundImage.identifier,
            })
        ),
      };

    default:
      return backgroundImage;
  }
};
