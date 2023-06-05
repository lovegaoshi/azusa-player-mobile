declare namespace NoxMedia {
  export interface Song {
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
    album?: string;
    addedDate?: number;
  }

  export interface Playlist {
    songList: Array<NoxMedia.Song>;
    title: string;
    id: string;
    subscribeUrl: Array<string>;
    blacklistedUrl: Array<string>;
    useBiliShazam: boolean;
    lastSubscribed: number;
    type: string;
  }

  export interface LyricDetail {
    songId: string;
    lyricKey: string;
    lyricOffset: number;
  }
}
