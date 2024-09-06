import { fetchMusicNew } from '../../src/utils/mediafetch/biliMusicNew';
test('biliMusicNew', async () => {
  const content = await fetchMusicNew();
  // console.log(content);
  expect(content[0].bvid).not.toBeUndefined();
}, 50000);
