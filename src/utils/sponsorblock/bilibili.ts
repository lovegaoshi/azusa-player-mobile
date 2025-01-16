import bfetch from '@utils/BiliFetch';
import logger from '../Logger';
import { SponsorBlockBili } from './Constants';

// https://github.com/hanydd/BilibiliSponsorBlock/wiki/API#1-%E8%8E%B7%E5%8F%96%E7%89%87%E6%AE%B5---bvid
const API = 'https://bsbsb.top/api/skipSegments?videoID={bvid}';

export const getSponsorBlock = async (
  bvid: string,
): Promise<SponsorBlockBili | undefined> => {
  const res = await bfetch(API.replace('{bvid}', bvid));
  if (res.status !== 200) {
    logger.info(
      `[sponsorblock.bilibili] ${bvid}: ${res.status} ${res.statusText}`,
    );
    return;
  }
  const json = await res.json();
  return json;
};
