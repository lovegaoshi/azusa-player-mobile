declare namespace NoxUtils {
  export type RegexMatchOperations<T> = Array<
    [RegExp, (song: NoxMedia.Song, iOS?: boolean) => Promise<T>]
  >;
}
