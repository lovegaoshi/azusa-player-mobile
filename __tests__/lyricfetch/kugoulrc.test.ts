import kugouLrcFetch from '../../src/utils/lrcfetch/kugou';
test('kugou lrc', async () => {
  const lrcContent = await kugouLrcFetch.getLyric(
    '23FEA80D47ED659C8A7C6CFCBD217DD0'
  );
  expect(lrcContent.length).not.toBe(0);
  const content = await kugouLrcFetch.getLrcOptions('hillsong young wake');
  expect(content[0].key).not.toBeNull();
}, 33333);
