export enum PlaylistTypes {
  Typical = 'typical',
  Search = 'search',
  Favorite = 'favorite',
}

export const SearchRegex: { [key: string]: { regex: RegExp; text: string } } = {
  absoluteMatch: { regex: /Parsed:(.+)/, text: 'Parsed:' },
  artistMatch: { regex: /Artist:(.+)/, text: 'Artist:' },
  albumMatch: { regex: /Album:(.+)/, text: 'Album:' },
  cachedMatch: { regex: /Cached:(.*)/, text: 'Cached:' },
  durationLessMatch: { regex: /Duration<:(\d+)/, text: 'Duration<:' },
  durationMoreMatch: { regex: /Duration>:(\d+)/, text: 'Duration>:' },
};

export enum SortOptions {
  Title = 'TITLE',
  Artist = 'ARTIST',
  Album = 'ALBUM',
  Date = 'DATE',
  PreviousOrder = 'PREVIOUS_ORDER',
}

export const PLAYLIST_MEDIAID = 'playlist-';
