export interface YTSongRowCard {
  cover: string;
  name: string;
  singer?: string;
  getPlaylist: () => Promise<{ songs: NoxMedia.Song[]; item?: NoxMedia.Song }>;
}

export interface YTSongRowProp {
  songs?: YTSongRowCard[];
  title?: string;
}
