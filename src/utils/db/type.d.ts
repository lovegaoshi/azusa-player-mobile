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

export interface Song {
  internalid?: number;
  id: string;
  bvid: string;
  name: string;
  nameRaw: string;
  singer: string;
  singerId: string;
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
  source?: string;
  isLive?: boolean;
  liveStatus?: boolean;
}

export interface Playlist {
  internalid: number;
  id: string;
  title: string;
  type: string;
  lastSubscribed: number;
  songList: string;
  settings: string;
}

export interface Override {
  r128gain?: boolean;
  abrepeat?: boolean;
  lyric?: boolean;
  playlist?: boolean;
  playbackCount?: boolean;
  song?: boolean;
}
