import { fetchMusicHot } from '../../src/utils/mediafetch/biliMusicHot';
test('biliMusicHot', async () => {
  const content = await fetchMusicHot();
  // console.log(content);
  expect(content[0].bvid).not.toBeUndefined();
}, 50000);
