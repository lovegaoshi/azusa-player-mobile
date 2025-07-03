import ytLrcFetch from '../../src/utils/lrcfetch/yt';
test('yt lrc', async () => {
  const content = await ytLrcFetch.getLyric('mYVzme2fybU');
  expect(content.length > 0).toBe(true);
});
