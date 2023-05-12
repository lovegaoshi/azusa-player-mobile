interface metaData {
  themeName: string;
  themeDesc: string;
  themeAuthor: string;
}
export default interface style {
  metaData: metaData;
  lightTheme: boolean;
  screenBackgroundColor: string;
  playlistDrawerBackgroundColor: string;

  gifs: Array<string>;
  backgroundImages: Array<string>;
}
