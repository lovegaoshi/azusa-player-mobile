// vanilla store of zustand serving playbackServices.
import { createStore } from 'zustand/vanilla';

import { getRegExtractMapping } from '@utils/ChromeStorage';
import rejson from '../utils/rejson.json';
import { loadJSONRegExtractors } from '../utils/re';

interface RegexStore {
  reExtractSongName: (name: string, uploader: string | number) => string;
}

const regexStore = createStore<RegexStore>(() => ({
  reExtractSongName: (val: string) => val,
}));

export const initialize = async () => {
  const savedRegExt = await getRegExtractMapping();
  regexStore.setState({
    reExtractSongName: loadJSONRegExtractors(
      savedRegExt.length > 0
        ? savedRegExt
        : (rejson as NoxRegExt.JSONExtractor[]),
    ),
  });
};

export const reExtractSongName = (name: string, uploader: string | number) =>
  regexStore.getState().reExtractSongName(name, uploader);

export const parseSongName = (song: NoxMedia.Song): NoxMedia.Song => {
  return {
    ...song,
    parsedName: reExtractSongName(song.name, song.singerId),
  };
};

export default regexStore;
