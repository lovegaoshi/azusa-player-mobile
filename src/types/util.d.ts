declare namespace NoxUtils {
  export type RegexMatchResolve<T> = Array<
    [RegExp, (song: NoxMedia.Song, iOS?: boolean) => Promise<T>]
  >;
  export type RegexMatchSuggest<T> = Array<
    [RegExp, (song: NoxMedia.Song, filterMW?: <K>(v: K[]) => K) => Promise<T>]
  >;
}
