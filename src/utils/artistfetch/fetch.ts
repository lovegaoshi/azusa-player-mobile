import { Source } from '@enums/MediaFetch';
import fetchBiliArtist from './biliartist';

export const goToArtistExternalPage = (song?: NoxMedia.Song) => {
  switch (song?.source) {
    case Source.bilivideo:
      return `https://space.bilibili.com/${song.singerId}`;
  }
};

export default (song?: NoxMedia.Song) => {
  switch (song?.source) {
    case Source.bilivideo:
      return fetchBiliArtist(String(song.singerId));
  }
};
