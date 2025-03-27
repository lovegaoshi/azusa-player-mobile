import { Source } from '@enums/MediaFetch';
import fetchBiliArtist from './biliartist';

export default (song: NoxMedia.Song) => {
  switch (song.source) {
    case Source.bilivideo:
      return fetchBiliArtist(String(song.singerId));
  }
  return;
};
