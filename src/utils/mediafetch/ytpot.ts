import NativeNoxModule from '@specs/NativeNoxModule';
import { isAndroid } from '@utils/RNUtils';

import nodejs from '@utils/nodejs';
import logger from '../Logger';

let results: { poToken?: string; identifier?: string } = {};

nodejs?.channel?.addListener?.('potoken', msg => {
  results = JSON.parse(msg);
});

export const getAndroidPoT = async (videoId: string) => {
  if (!isAndroid) return;
  logger.debug(`[ytpot] involking newpipe to get Pot for ${videoId}`);
  return NativeNoxModule?.getPOToken(videoId)?.streamingDataPoToken;
};

export const getPoT = async (videoId: string, timeout = 100) => {
  if (isAndroid) return getAndroidPoT(videoId);
  logger.debug(`[ytpot] involking node to get Pot for ${videoId}`);
  if (nodejs.channel === undefined) {
    logger.warn(`[ytpot] node is not available.`);
    return;
  }
  nodejs.channel.post('potoken', videoId);
  let timeoutCounter = 0;
  while (timeoutCounter < timeout) {
    timeoutCounter += 1;
    await new Promise(resolve => setTimeout(resolve, 100));
    if (results.identifier === videoId) {
      logger.log(results.poToken);
      return results.poToken;
    }
  }
  logger.error(`[ytpot] failed to get PoT for ${videoId} via node. within 10s`);
  return getAndroidPoT(videoId);
};
