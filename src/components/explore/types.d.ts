export interface YTSongRowCard {
  cover: string;
  name: string;
  singer?: string;
  getPlaylist: (
    progressEmitter?: NoxUtils.ProgressEmitter,
  ) => Promise<{ songs: NoxMedia.Song[]; item?: NoxMedia.Song }>;
}

export interface YTSongRowProp {
  playlists?: YTSongRowCard[];
  title?: string;
}
