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
    source?: string;
    isLive?: boolean;
    liveStatus?: boolean;
    metadataOnLoad?: boolean;
  }

  export interface Playlist {
    title: string;
    id: string;
    type: string;

    songList: Array<NoxMedia.Song>;

    subscribeUrl: Array<string>;
    blacklistedUrl: Array<string>;
    lastSubscribed: number;

    useBiliShazam: boolean;
    biliSync: boolean;
    newSongOverwrite?: boolean;

    sort?: SORT_OPTIONS;
  }

  export interface LyricDetail {
    songId: string;
    lyricKey: string;
    lyricOffset: number;
    lyric: string;
  }
}
