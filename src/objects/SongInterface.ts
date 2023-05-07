import { v4 as uuidv4 } from 'uuid';

export default interface Song {
  id: string;
  bvid: string;
  name: string;
  nameRaw: string;
  singer: string;
  singerId: string | number;
  cover: string;
  lyric: string | undefined;
  lyricOffset: number | undefined;
  parsedName: string;
  biliShazamedName: string | undefined;
  page: number | undefined;
  duration: number;
}

export const dummySong = (): Song => {
  return {
    id: uuidv4(),
    bvid: '0',
    name: 'dummySong',
    nameRaw: 'dummySong',
    singer: 'dummyArtist',
    singerId: 0,
    cover: '',
    lyric: '',
    lyricOffset: 0,
    parsedName: 'dummySongParsed',
    biliShazamedName: '',
    page: 0,
    duration: 0,
  };
};

export const dummySongObj = dummySong();
