declare namespace NoxUtils {
  export type RegexMatchResolve<T> = Array<
    [RegExp, (song: NoxMedia.Song, iOS?: boolean) => T]
  >;
  export type RegexMatchSuggest<T> = Array<
    [RegExp, (song: NoxMedia.Song, filterMW?: <K>(v: K[]) => K) => Promise<T>]
  >;
  /*
  D  {"duration":"348061","artist":"Mr. Scruff","bitrate":"192000",
  "realPath":"/storage/emulated/0/Download/Kalimba.mp3",
  "URI":"content://external/audio/media/1000000038","title":"Kalimba",
  "album":"Ninja Tuna","fileName":"Kalimba.mp3","relativePath":"Download/"}
  D  {"duration":"3997","artist":"<unknown>","bitrate":"192000",
  "realPath":"/storage/1D1D-1801/Music/Free_Test_Data_100KB_MP3.mp3",
  "URI":"content://external/audio/media/1000000034","title":"Free_Test_Data_100KB_MP3",
  "album":"Music","fileName":"Free_Test_Data_100KB_MP3.mp3","relativePath":"Music/"}
  */
  interface NoxFileUtilMediaInfo {
    duration: number;
    artist: string;
    bitrate: number;
    realPath: string;
    URI: string;
    title: string; // either real id3 or the file name, which works
    album: string; // either real id3 or the folder name
    fileName: string;
    relativePath: string;
  }
}
