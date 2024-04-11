import {
  getKugouLyricOptions,
  getKugouLyric,
} from '../../src/utils/lrcfetch/kugou';
test('kugou lrc', async () => {
  const lrcContent = await getKugouLyric('23FEA80D47ED659C8A7C6CFCBD217DD0');
  expect(lrcContent.length).not.toBe(0);
  const content = await getKugouLyricOptions('hillsong young wake');
  expect(content[0].key).not.toBeNull();
});
