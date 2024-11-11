import { fetchYtbiSearch } from '../../src/utils/mediafetch/ytbSearch.ytbi';
import { fetchInnerTuneSearch } from '../../src/utils/mediafetch/ytbSearch.muse';

test('ytbsearch', async () => {
  const content = await fetchYtbiSearch('maroon 5');
  console.log(content.songs.length);
  expect(content.songs[0]?.id).not.toBeUndefined();
});

test('museSearch', async () => {
  const content = await fetchInnerTuneSearch('maroon 5');
  console.log(content.length);
  expect(content[0]?.id).not.toBeUndefined();
});
