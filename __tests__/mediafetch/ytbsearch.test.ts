import { fetchYtbiSearch } from '../../src/utils/mediafetch/ytbSearch.ytbi';
test('ytbsearch', async () => {
  const content = await fetchYtbiSearch('maroon 5');
  console.log(content.songs.length);
  expect(content.songs[0]?.id).not.toBeUndefined();
});
