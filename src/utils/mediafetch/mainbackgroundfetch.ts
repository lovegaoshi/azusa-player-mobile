import { fetchVideoPlayUrl } from '@utils/mediafetch/bilivideo';
import { biliNFTVideoFetch } from '@utils/mediafetch/biliNFT';
import { biliGarbHeadVideoFetch } from '@utils/mediafetch/biliGarb';
import { cacheWrapper } from '@utils/Cache';

export enum RESOLVE_TYPE {
  bvid = 'bvid',
  video = 'video',
  biliNFTVideo = 'biliNFTVideo',
  biliGarbHeadVideo = 'biliGarbHeadVideo',
  image = 'image',
}

export const resolveBackgroundImage = async (
  backgroundImage: string | NoxTheme.backgroundImage
) => {
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
      const [act_id, index] = JSON.parse(backgroundImage.identifier);
      return {
        type: RESOLVE_TYPE.video,
        identifier: await cacheWrapper(
          `${RESOLVE_TYPE.biliNFTVideo}-${backgroundImage.identifier}`,
          () => biliNFTVideoFetch({ act_id, index })
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
