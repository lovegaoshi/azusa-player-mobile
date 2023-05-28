import { EXPORT_OPTIONS } from '../enums/Sync';

declare namespace NoxStorage {
  export interface PlayerSettingDict {
    autoRSSUpdate: boolean;
    skin: string;
    parseSongName: boolean;
    keepSearchedSongListWhenPlaying: boolean;
    settingExportLocation: EXPORT_OPTIONS;
    personalCloudIP: string;
    personalCloudID: string;
    noxVersion: string;
    noxCheckedVersion: string;
    hideCoverInMobile: boolean;
    loadPlaylistAsArtist: boolean;
    sendBiliHeartbeat: boolean;
    // TODO: implement this feature
    noCookieBiliSearch: boolean;
    // TODO: implement this feature
    dataSaver: boolean;
    fastBiliSearch: boolean;
    appID: string;
    language?: string;
    [key: string]: any;
  }

  export interface PlayerStorageObject {
    settings: PlayerSettingDict;
    playlistIds: Array<string>;
    playlists: { [key: string]: NoxMedia.Playlist };
    lastPlaylistId: [string, string];
    searchPlaylist: NoxMedia.Playlist;
    favoriPlaylist: NoxMedia.Playlist;
    playerRepeat: string;
    skin: NoxTheme.style;
    skins: any[];
    // site: set-cookie header
    cookies: { [key: string]: string };
    lyricMapping: Map<string, NoxMedia.LyricDetail>;
    language?: string;
  }
}
