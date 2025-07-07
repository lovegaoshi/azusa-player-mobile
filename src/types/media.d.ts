import { SortOptions, PlaylistTypes } from '@enums/Playlist';
import { Source } from '@enums/MediaFetch';
import { LrcSource } from '@enums/LyricFetch';
import { NoxRepeatMode } from '@enums/RepeatMode';

declare global {
  namespace NoxMedia {
    type SongSource = Source;

    export interface Song {
      internalid?: number;
      id: string;
      bvid: string;
      name: string;
      nameRaw: string;
      singer: string;
      singerId: string | number;
      cover: string;
      coverLowRes?: string;
      lyric?: string;
      lyricOffset?: number;
      parsedName: string;
      biliShazamedName?: string;
      page?: number;
      duration: number;
      album?: string;
      addedDate?: number;
      source?: SongSource;
      isLive?: boolean;
      liveStatus?: boolean;
      metadataOnLoad?: boolean;
      metadataOnReceived?: boolean;
      order?: number;
      localPath?: string;

      backgroundOverride?: string;
      MVsync?: boolean;
      MVHide?: boolean;
    }

    export interface Playlist {
      title: string;
      id: string;
      type: PlaylistTypes;

      songList: Song[];

      subscribeUrl: string[];
      blacklistedUrl: string[];
      lastSubscribed: number;

      useBiliShazam: boolean;
      biliSync: boolean;
      newSongOverwrite?: boolean;

      sort?: SortOptions;
      repeatMode?: NoxRepeatMode;
      // function to support infinite loading; only applicable to
      // search playlists. bc we stringify playlists, this will be
      // lost upon loading from storage
      refresh?: (v: Playlist) => Promise<SearchPlaylist>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      refreshToken?: any;
    }

    export interface SearchPlaylist extends Partial<Playlist> {
      songList: Song[];
    }

    export interface LyricDetail {
      songId: string;
      lyricKey: string;
      lyricOffset: number;
      lyric: string;
      source?: LrcSource;
    }

    export interface FFProbeMetadata {
      duration: number;
    }
  }
}
