import bfetch from '@utils/BiliFetch';
import SongTS from '@objects/Song';
import { Source } from '@enums/MediaFetch';

const headFetch = async (url: string): Promise<NoxMedia.Song | undefined> => {
  if (!url.startsWith('https://')) return;
  try {
    const res = await bfetch(url, { method: 'HEAD' });
    if (res.headers.get('content-type')?.startsWith('audio')) {
      const urlObj = new URL(url);
      const fn = urlObj.pathname.substring(
        urlObj.pathname.lastIndexOf('/') + 1
      );
      return SongTS({
        cid: `${Source.rawhttp}-${url}`,
        bvid: url,
        name: fn,
        nameRaw: fn,
        singer: urlObj.hostname,
        singerId: urlObj.hostname,
        cover: '',
        lyric: '',
        page: 1,
        duration: 0,
        album: fn,
        source: Source.rawhttp,
      });
    }
  } catch (e) {
    console.warn(e);
  }
  return;
};

const resolveURL = async (song: NoxMedia.Song) => ({ url: song.bvid });

export default {
  regexFetch: headFetch,
  regexResolveURLMatch: /^rawhttp-/,
  resolveURL,
};
