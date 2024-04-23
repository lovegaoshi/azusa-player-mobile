import { fetchMusicTop } from '../../src/utils/mediafetch/biliMusicTop';
test('biliMusicTop', async () => {
  const content = await fetchMusicTop();
  // console.log(content);
  expect(content[0].bvid).not.toBeNull();
}, 50000);
