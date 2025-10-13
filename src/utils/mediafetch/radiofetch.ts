import { Source } from '@enums/MediaFetch';
import logger from '../Logger';

export default function radioFetch(song?: NoxMedia.Song) {
  if (!song) return;
  switch (song?.source) {
    case Source.ytbvideo:
      return `youtu.be/list=RDAMVM${song.bvid}`;
    case Source.bilivideo:
      return `bilibili.com/video/similarvideo/${song.bvid}`;
    default:
      logger.debug(
        `[startRadio] ${song?.bvid} deos not have a start radio handle.`,
      );
  }
}
