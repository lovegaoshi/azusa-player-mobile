import { fetchMusicComp } from '../../src/utils/mediafetch/biliMusicComp';
test('biliMusicComp', async () => {
  const content = await fetchMusicComp();
  // console.log(content);
  expect(content[0].bvid).not.toBeNull();
}, 50000);
