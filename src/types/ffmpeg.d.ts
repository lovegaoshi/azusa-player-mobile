declare namespace NoxFFMpeg {
  interface ToMp3 {
    song: NoxMedia.Song;
    fspath: string;
    writeID3?: boolean;
    embedArt?: boolean;
  }
}
