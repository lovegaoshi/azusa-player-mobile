export const toMixedContent = <T>(contents: T, title: string) => ({
  title,
  contents,
  subtitle: '',
  thumbnails: [],
  browseId: '',
  display: null,
});
