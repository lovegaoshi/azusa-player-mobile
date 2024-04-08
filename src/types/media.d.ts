import { SORT_OPTIONS, PLAYLIST_ENUMS } from '@enums/Playlist';
import { MUSICFREE } from '@utils/mediafetch/musicfree';

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
      source?: NoxEnumMediaFetch.Source | MUSICFREE;
      isLive?: boolean;
      liveStatus?: boolean;
      metadataOnLoad?: boolean;
      order?: number;
    }

    export interface Playlist {
      title: string;
      id: string;
      type: PLAYLIST_ENUMS;

      songList: Array<Song>;

      subscribeUrl: Array<string>;
      blacklistedUrl: Array<string>;
      lastSubscribed: number;

      useBiliShazam: boolean;
      biliSync: boolean;
      newSongOverwrite?: boolean;

      sort?: SORT_OPTIONS;
      // function to support infinite loading; only applicable to
      // search playlists. bc we stringify playlists, this will be
      // lost upon loading from storage
      refresh?: (v: Playlist) => Promise<SearchPlaylist>;
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
