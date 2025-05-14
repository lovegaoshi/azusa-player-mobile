export interface PlaybackCount {
  songcid: string;
  count: number;
  lastPlayed: number | null;
}

export interface R128Gain {
  songcid: string;
  r128gain: number | null;
}

export interface ABRepeat {
  songcid: string;
  a: number | null;
  b: number | null;
}

export interface Lyric {
  songId: string;
  lyric: string;
  lyricKey: string;
  lyricOffset: number;
  source?: string | null;
}

export interface Song {}

export interface Playlist {}
