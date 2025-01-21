import { Source } from '@enums/MediaFetch';
import { getSponsorBlock as getSponsorBlockBili } from './bilibili';
import { getSponsorBlock as getSponsorYtb } from './ytb';

export const getSponsorBlock = async (song: NoxMedia.Song) => {
  switch (song.source) {
    case Source.bilivideo:
      return getSponsorBlockBili(song);
    case Source.ytbvideo:
      return getSponsorYtb(song);
  }
  return [];
};
