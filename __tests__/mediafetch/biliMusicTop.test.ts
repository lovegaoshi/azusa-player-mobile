import { fetchCurrentMusicTop } from '../../src/utils/mediafetch/biliMusicTop';
test('biliMusicTop', async () => {
  const content = await fetchCurrentMusicTop();
  // console.log(content);
  expect(content[0].bvid).not.toBeUndefined();
}, 50000);
