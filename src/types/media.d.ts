declare namespace NoxMedia {
  export interface Song {
    id: string;
    bvid: string;
    name: string;
    nameRaw: string;
    singer: string;
    singerId: string | number;
    cover: string;
    lyric?: string;
    lyricOffset?: number;
    parsedName: string;
    biliShazamedName?: string;
    page?: number;
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
    biliSync: boolean;
  }

  export interface LyricDetail {
    songId: string;
    lyricKey: string;
    lyricOffset: number;
  }
}
