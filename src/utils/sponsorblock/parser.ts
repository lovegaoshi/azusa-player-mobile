import { Source } from '@enums/MediaFetch';
import { getSponsorBlock as getSponsorBlockBili } from './bilibili';

export const getSponsorBlock = async (song: NoxMedia.Song) => {
  switch (song.source) {
    case Source.bilivideo:
      return getSponsorBlockBili(song);
  }
  return [];
};
