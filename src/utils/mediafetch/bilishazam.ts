import { setSongBiliShazamed } from '@objects/Song';
import bfetch from '@utils/BiliFetch';
import { biliTagApiLimiter } from './throttle';
import { logger } from '../Logger';
import { extractSongName } from '../re';

/**
 *  API that gets the tag of a video. sometimes bilibili identifies the BGM used.
 * https://api.bilibili.com/x/web-interface/view/detail/tag?bvid=BV1sY411i7jP&cid=1005921247
 */
const URL_VIDEO_TAGS =
  'https://api.bilibili.com/x/web-interface/view/detail/tag?bvid={bvid}&cid={cid}';

interface Ids {
  bvid: string;
  cid: string;
}
const fetchVideoTagPromise = ({ bvid, cid }: Ids) => {
  return biliTagApiLimiter.schedule(() =>
    fetchVideoTagPromiseRaw({ bvid, cid }),
  );
};

const fetchVideoTagPromiseRaw = async ({ bvid, cid }: Ids) => {
  const req = await bfetch(
    URL_VIDEO_TAGS.replace('{bvid}', bvid).replace('{cid}', cid),
  );
  const json = await req.json();
  try {
    if (json.data[0].tag_type === 'bgm') {
      // its like this now?? 发现《Kiss Me More》
      return extractSongName(json.data[0].tag_name);
    }
    return null;
  } catch (e) {
    logger.error(e);
    logger.warn(
      `fetching videoTag for ${bvid}, ${cid} failed. if ${cid} is a special tag its expected.`,
    );
    return null;
  }
};

/**
 * uses the bilibili tag API to acquire bilibili shazamed results to a list of videos.
 */
export const biliShazamOnSonglist = (
  songlist: NoxMedia.Song[],
  forced = false,
  progressEmitter: NoxUtils.ProgressEmitter = () => undefined,
  biliShazam = false,
) => {
  if (!biliShazam) return songlist;
  const newSongList = songlist.map((song, index) => {
    if (!song.biliShazamedName || forced) {
      return new Promise<NoxMedia.Song>(resolve =>
        fetchVideoTagPromise({ bvid: song.bvid, cid: song.id })
          // getBiliShazamedSongname({ bvid: song.bvid, cid: song.id, name: null })
          .then(val => {
            progressEmitter((index / songlist.length) * 100);
            resolve(setSongBiliShazamed(song, val));
          }),
      );
    }
    return song;
  });
  return Promise.all(newSongList);
};
