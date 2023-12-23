import { SORT_OPTIONS } from '@enums/Playlist';

declare global {
  namespace NoxMedia {
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
      order?: number;
    }

    export interface Playlist {
      title: string;
      id: string;
      type: string;

      songList: Array<Song>;

      subscribeUrl: Array<string>;
      blacklistedUrl: Array<string>;
      lastSubscribed: number;

      useBiliShazam: boolean;
      biliSync: boolean;
      newSongOverwrite?: boolean;

      sort?: SORT_OPTIONS;
      refresh?: (v: Playlist) => Promise<Partial<Playlist>>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      refreshToken?: any;
    }

    export interface SearchPlaylist extends Partial<Playlist> {
      songList: Array<Song>;
    }

    export interface LyricDetail {
      songId: string;
      lyricKey: string;
      lyricOffset: number;
      lyric: string;
    }
  }
}
