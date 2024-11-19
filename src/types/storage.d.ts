/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColorSchemeName } from 'react-native';

import { SyncOptions } from '../enums/Sync';
import { NoxRepeatMode } from '../enums/RepeatMode';
import { SearchOptions } from '../enums/Storage';

declare global {
  namespace NoxStorage {
    export interface PlayerSettingDict {
      playMode: string;
      defaultPlayMode: string;
      defaultVolume: number;

      autoRSSUpdate: boolean;
      skin: string;
      parseSongName: boolean;
      keepSearchedSongListWhenPlaying: boolean;
      settingExportLocation: SyncOptions;
      personalCloudIP: string;
      personalCloudID: string;
      noxVersion: string;
      noxCheckedVersion: string;

      hideCoverInMobile: boolean;
      loadPlaylistAsArtist: boolean;
      sendBiliHeartbeat: boolean;
      noCookieBiliSearch: boolean;
      dataSaver: boolean;
      fastBiliSearch: boolean;
      noInterruption: boolean;
      updateLoadedTrack: boolean;
      r128gain: boolean;
      prefetchTrack: boolean;
      // TODO: implement this feature
      chatGPTResolveSongName: boolean;
      trackCoverArtCard: boolean;
      suggestedSkipLongVideo: boolean;
      wavyProgressBar: boolean;
      screenAlwaysWake: boolean;
      keepForeground: boolean;
      karaokeLyrics: boolean;
      accentColor: boolean;
      memoryEfficiency: boolean;
      useSuggestion: boolean;
      noRepeat: boolean;
      audioOffload?: boolean;
      skipSilence: boolean;
      parseEmbeddedArtwork: boolean;
      crossfade: number;
      preferYTMSuggest: boolean;
      artworkRes: number;
      artworkCarousel: boolean;

      appID: string;
      language?: string;
      cacheSize: number;

      downloadLocation?: string;
      downloadToMp3: boolean;
      downloadID3V2: boolean;
      downloadEmbedAlbumCover: boolean;

      [key: string]: any;
    }

    export interface PlayerStorageObject {
      settings: PlayerSettingDict;
      playlistIds: string[];
      playlists: { [key: string]: NoxMedia.Playlist };
      lastPlaylistId: [string, string];
      searchPlaylist: NoxMedia.Playlist;
      favoriPlaylist: NoxMedia.Playlist;
      playbackMode: NoxRepeatMode;
      skin: NoxTheme.Style;
      skins: any[];
      // site: set-cookie header
      cookies: { [key: string]: string };
      lyricMapping: Map<string, NoxMedia.LyricDetail>;
      language?: string;
      lastPlayDuration: number;
      colorScheme: ColorSchemeName;
      defaultSearchOptions?: SearchOptions;
      AListCred: AListCred[];
    }

    export interface initializedResults {
      currentPlayingList: NoxMedia.Playlist;
      currentPlayingID: string;
      playlists: { [key: string]: NoxMedia.Playlist };
      storedPlayerSetting: NoxStorage.PlayerSettingDict;
      cookies: { [key: string]: string };
      language?: string;
      lastPlayDuration: number;
      playbackMode: NoxRepeatMode;
    }

    export interface R128Dict {
      [key: string]: number | null;
    }

    export interface ABDict {
      [key: string]: [number, number];
    }

    export interface DownloadDict {
      [key: string]: Promise<void | string>;
    }

    interface DownloadPromise {
      song: NoxMedia.Song;
      promise: Promise<void>;
      progress: number;
    }

    type AListCred = [string, string];
  }
}
