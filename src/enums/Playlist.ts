export enum PLAYLIST_ENUMS {
  TYPE_TYPICA_PLAYLIST = 'typical',
  TYPE_SEARCH_PLAYLIST = 'search',
  TYPE_FAVORI_PLAYLIST = 'favorite',
}

export const SearchRegex: { [key: string]: { regex: RegExp; text: string } } = {
  absoluteMatch: { regex: /Parsed:(.+)/, text: 'Parsed:' },
  artistMatch: { regex: /Artist:(.+)/, text: 'Artist:' },
  albumMatch: { regex: /Album:(.+)/, text: 'Album:' },
  cachedMatch: { regex: /Cached:/, text: 'Cached:' },
};
