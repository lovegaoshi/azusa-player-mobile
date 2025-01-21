import bfetch from '@utils/BiliFetch';
import logger from '../Logger';
import { SponsorBlockBili } from './Constants';

// https://wiki.sponsor.ajay.app/w/API_Docs
const API = 'https://sponsor.ajay.app/api/skipSegments?videoID={bvid}';

const _getSponsorBlock = async (bvid: string): Promise<SponsorBlockBili[]> => {
  try {
    const res = await bfetch(API.replace('{bvid}', bvid));
    if (res.status !== 200) {
      logger.info(
        `[sponsorblock.ytb] ${bvid}: ${res.status} ${res.statusText}`,
      );
      return [];
    }
    const json = (await res.json()) as SponsorBlockBili[];
    return json;
  } catch {
    return [];
  }
};

export const getSponsorBlock = (
  song: NoxMedia.Song,
): Promise<SponsorBlockBili[]> => _getSponsorBlock(song.bvid);
