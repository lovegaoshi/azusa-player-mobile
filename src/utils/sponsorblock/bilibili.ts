import bfetch from '@utils/BiliFetch';
import logger from '../Logger';
import { SponsorBlockBili } from './Constants';
import { fetchCID } from '../mediafetch/bilivideo';

// https://github.com/hanydd/BilibiliSponsorBlock/wiki/API#1-%E8%8E%B7%E5%8F%96%E7%89%87%E6%AE%B5---bvid
const API = 'https://bsbsb.top/api/skipSegments?videoID={bvid}';

const _getSponsorBlock = async (
  bvid: string,
  cid: string,
): Promise<SponsorBlockBili[]> => {
  try {
    const res = await bfetch(API.replace('{bvid}', bvid));
    if (res.status !== 200) {
      logger.info(
        `[sponsorblock.bilibili] ${bvid}: ${res.status} ${res.statusText}`,
      );
      return [];
    }
    const json = (await res.json()) as SponsorBlockBili[];
    return json.filter(v => v.cid === cid);
  } catch {
    return [];
  }
};

export const getSponsorBlock = async (
  song: NoxMedia.Song,
): Promise<SponsorBlockBili[]> => {
  const bvid = song.bvid;
  let cid = song.id;
  if (!cid || cid.includes('null')) {
    cid = await fetchCID(bvid);
  }
  return _getSponsorBlock(bvid, String(cid));
};
