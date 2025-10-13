import { Source } from '@enums/MediaFetch';
import fetchBiliArtist from './biliartist';
import fetchYtbiArtist from './ytartist.ytbi';
import fetchYtmArtist from './ytmartist.ytbi';

export const goToArtistExternalPage = (song?: NoxMedia.Song) => {
  switch (song?.source) {
    case Source.bilivideo:
      return `https://space.bilibili.com/${song.singerId}`;
    case Source.ytbvideo:
      return `https://www.youtube.com/channel/${song.singerId}`;
  }
};

export default function APMfetch(song?: NoxMedia.Song) {
  switch (song?.source) {
    case Source.bilivideo:
      return fetchBiliArtist(String(song.singerId));
    case Source.ytbvideo:
      return fetchYtmArtist(String(song.singerId)).catch(() =>
        fetchYtbiArtist(String(song.singerId)).catch(console.error),
      );
  }
}
