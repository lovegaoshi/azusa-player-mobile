import { LrcSource } from '@/enums/LyricFetch';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  declare namespace NoxNetwork {
    export interface RequestInit {
      method: string;
      headers: any;
      body?: any;
      referrer?: string;
      credentials?: RequestCredentials_;
    }
    /**
     * this interface denotes the parsed resolveURL object from each fetcher.
     * TODO: refactor into below...
     */

    export interface ParsedNoxMediaURL {
      url: string;
      cover?: string;
      duration?: number;
      loudness?: number;
      perceivedLoudness?: number;
    }
    /**
     * this interface denotes the FINAL parsed resolveURL object.
     */
    export interface ResolvedNoxMediaURL {
      duration?: number;
      artwork?: string;
      url: string;
      headers: {
        [key: string]: any;
      };
      userAgent: string;
      urlRefreshTimeStamp: number;
    }

    export interface NoxFetchedLyric {
      key: string;
      songMid: string;
      label: string;
      source?: LrcSource;
    }

    export interface NoxRegexFetch {
      songList: NoxMedia.Song[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      refreshToken?: any;
      refresh?: (v: Playlist) => Promise<SearchPlaylist>;
    }
  }
}
